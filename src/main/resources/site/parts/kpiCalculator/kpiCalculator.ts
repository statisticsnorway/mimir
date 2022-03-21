import { Content } from 'enonic-types/content'
import { PageContributions, Request, Response } from 'enonic-types/controller'
import { ResourceKey } from 'enonic-types/thymeleaf'
import { CalculatorPeriod } from '../../../lib/types/calculator'
import { DropdownItem as MonthDropdownItem, DropdownItems as MonthDropdownItems } from '../../../lib/types/components'
import { Data, Dataset, Dimension } from '../../../lib/types/jsonstat-toolkit'
import { Language, Phrases } from '../../../lib/types/language'
import { React4xp, React4xpObject, React4xpResponse } from '../../../lib/types/react4xp'
import { CalculatorConfig } from '../../content-types/calculatorConfig/calculatorConfig'
import { KpiCalculatorPartConfig } from './kpiCalculator-part-config'

const {
  getComponent,
  getContent,
  serviceUrl,
  pageUrl
} = __non_webpack_require__('/lib/xp/portal')
const {
  render
} = __non_webpack_require__('/lib/thymeleaf')
const {
  renderError
} = __non_webpack_require__('/lib/ssb/error/error')
const React4xp: React4xp = __non_webpack_require__('/lib/enonic/react4xp')
const {
  getLanguage
} = __non_webpack_require__('/lib/ssb/utils/language')
const {
  getCalculatorConfig, getKpiDatasetMonth
} = __non_webpack_require__('/lib/ssb/dataset/calculator')
const {
  fromPartCache
} = __non_webpack_require__('/lib/ssb/cache/partCache')
const i18nLib = __non_webpack_require__('/lib/xp/i18n')
const view: ResourceKey = resolve('./kpiCalculator.html')

exports.get = function(req: Request): Response {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

exports.preview = function(req: Request): Response {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

function renderPart(req: Request): Response {
  const page: Content = getContent()
  let kpiCalculator: React4xpResponse | undefined
  if (req.mode === 'edit') {
    kpiCalculator = getKpiCalculatorComponent(page)
  } else {
    kpiCalculator = fromPartCache(req, `${page._id}-kpiCalculator`, () => {
      return getKpiCalculatorComponent(page)
    })
  }

  return {
    body: kpiCalculator.body,
    pageContributions: kpiCalculator.pageContributions as PageContributions
  }
}

function getKpiCalculatorComponent(page: Content): React4xpResponse {
  const config: KpiCalculatorPartConfig = getComponent().config
  const frontPage: boolean = !!config.frontPage
  const frontPageIngress: string | null | undefined = config.ingressFrontpage && config.ingressFrontpage
  const language: Language = getLanguage(page)
  const phrases: Phrases = language.phrases as Phrases
  const calculatorConfig: Content<CalculatorConfig> | undefined = getCalculatorConfig()
  const kpiDataMonth: Dataset | null = getKpiDatasetMonth(calculatorConfig)
  const months: MonthDropdownItems = allMonths(phrases, frontPage)
  const lastUpdated: CalculatorPeriod = lastPeriod(kpiDataMonth)
  const nextUpdate: CalculatorPeriod = nextPeriod(lastUpdated.month as string, lastUpdated.year as string)
  const nextReleaseMonth: number = (nextUpdate.month as number) === 12 ? 1 : (nextUpdate.month as number) + 1
  const nextPublishText: string = i18nLib.localize({
    key: 'calculatorNextPublishText',
    locale: language.code,
    values: [
      monthLabel(months, language.code, lastUpdated.month as string),
      lastUpdated.year as string,
      monthLabel(months, language.code, nextUpdate.month as string),
      monthLabel(months, language.code, nextReleaseMonth)
    ]
  })
  const lastNumberText: string = i18nLib.localize({
    key: 'calculatorLastNumber',
    locale: language.code,
    values: [
      monthLabel(months, language.code, lastUpdated.month as string),
      lastUpdated.year as string
    ]
  })
  const calculatorArticleUrl: string | null | undefined = config.kpiCalculatorArticle && pageUrl({
    id: config.kpiCalculatorArticle
  })

  const kpiCalculatorComponent: React4xpObject = new React4xp('KpiCalculator')
    .setProps({
      kpiServiceUrl: serviceUrl({
        service: 'kpi'
      }),
      language: language.code,
      months,
      phrases,
      calculatorArticleUrl,
      nextPublishText,
      lastNumberText,
      lastUpdated,
      frontPage,
      frontPageIngress
    })
    .setId('kpiCalculatorId')
    .uniqueId()
  return {
    body: kpiCalculatorComponent.renderBody({
      body: render(view, {
        kpiCalculatorId: kpiCalculatorComponent.react4xpId
      })
    }),
    pageContributions: kpiCalculatorComponent.renderPageContributions({})
  }
}

function lastPeriod(kpiDataMonth: Dataset | null): CalculatorPeriod {
  const kpiDataYearDimension: Dimension | null = kpiDataMonth?.Dimension('Tid') as Dimension
  const dataYear: string | undefined = kpiDataYearDimension?.id as string
  const kpiDataMonthDimension: Dimension | null = kpiDataMonth?.Dimension('Maaned') as Dimension
  const dataMonth: Array<string> | undefined = kpiDataMonthDimension?.id as Array<string>
  const lastYear: string | undefined = dataYear?.[dataYear.length - 1]
  const dataLastYearMnd: Array<string> = []

  dataMonth.forEach(function(month) {
    const kpiMonthData: Data | null | undefined = kpiDataMonth?.Data({
      'Tid': lastYear,
      'Maaned': month
    })
    const verdi: Data['value'] | undefined = kpiMonthData?.value
    if (verdi != null) {
      dataLastYearMnd.push(month)
    }
  })
  const lastMonth: string = dataLastYearMnd[dataLastYearMnd.length - 1]

  return {
    month: lastMonth,
    year: lastYear
  }
}

function nextPeriod(month: string, year: string): CalculatorPeriod {
  let nextPeriodMonth: number = parseInt(month) + 1
  let nextPeriodYear: number = parseInt(year)

  if (Number(month) === 12) {
    nextPeriodMonth = 1
    nextPeriodYear = nextPeriodYear + 1
  }

  return {
    month: nextPeriodMonth,
    year: nextPeriodYear
  }
}

function allMonths(phrases: Phrases, frontPage: boolean): MonthDropdownItems {
  return [
    {
      id: '90',
      title: frontPage ? phrases.calculatorMonthAverageFrontpage : phrases.calculatorMonthAverage
    },
    {
      id: '01',
      title: phrases.january
    },
    {
      id: '02',
      title: phrases.february
    },
    {
      id: '03',
      title: phrases.march
    },
    {
      id: '04',
      title: phrases.april
    },
    {
      id: '05',
      title: phrases.may
    },
    {
      id: '06',
      title: phrases.june
    },
    {
      id: '07',
      title: phrases.july
    },
    {
      id: '08',
      title: phrases.august
    },
    {
      id: '09',
      title: phrases.september
    },
    {
      id: '10',
      title: phrases.october
    },
    {
      id: '11',
      title: phrases.november
    },
    {
      id: '12',
      title: phrases.december
    }
  ]
}

function monthLabel(months: MonthDropdownItems, language: string | undefined, month: number | string): string {
  const monthLabel: MonthDropdownItem | undefined = months.find((m) => parseInt(m.id) === parseInt(month as string))
  if (monthLabel) {
    return language === 'en' ? monthLabel.title : monthLabel.title.toLowerCase()
  }
  return ''
}
