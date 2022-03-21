import { Content } from 'enonic-types/content'
import { Request, Response } from 'enonic-types/controller'
import { ResourceKey } from 'enonic-types/thymeleaf'
import { CalculatorPeriod } from '../../../lib/types/calculator'
import { DropdownItem as MonthDropdownItem, DropdownItems as MonthDropdownItems } from '../../../lib/types/components'
import { Dataset, Dimension } from '../../../lib/types/jsonstat-toolkit'
import { Language, Phrases } from '../../../lib/types/language'
import { React4xp, React4xpObject, React4xpResponse } from '../../../lib/types/react4xp'
import { CalculatorConfig } from '../../content-types/calculatorConfig/calculatorConfig'
import { PifCalculatorPartConfig } from './pifCalculator-part-config'

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
} = __non_webpack_require__( '/lib/ssb/utils/language')
const {
  getCalculatorConfig, getPifDataset
} = __non_webpack_require__('/lib/ssb/dataset/calculator')
const {
  fromPartCache
} = __non_webpack_require__('/lib/ssb/cache/partCache')
const i18nLib = __non_webpack_require__('/lib/xp/i18n')
const view: ResourceKey = resolve('./pifCalculator.html')

exports.get = function(req: Request): Response | React4xpResponse {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

exports.preview = function(req: Request): Response | React4xpResponse {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

function renderPart(req: Request): Response | React4xpResponse {
  const page: Content = getContent()
  let pifCalculator: React4xpResponse | undefined
  if (req.mode === 'edit') {
    pifCalculator = getPifCalculatorComponent(page)
  } else {
    pifCalculator = fromPartCache(req, `${page._id}-pifCalculator`, () => {
      return getPifCalculatorComponent(page)
    })
  }

  return {
    body: pifCalculator.body,
    pageContributions: pifCalculator.pageContributions
  }
}

function getPifCalculatorComponent(page: Content): React4xpResponse {
  const partConfig: PifCalculatorPartConfig = getComponent().config
  const language: Language = getLanguage(page)
  const phrases: Phrases = language.phrases as Phrases
  const months: MonthDropdownItems = allMonths(phrases)
  const config: Content<CalculatorConfig> | undefined = getCalculatorConfig()
  const pifData: Dataset | null = getPifDataset(config)
  const lastUpdated: CalculatorPeriod | undefined = lastPeriod(pifData) as CalculatorPeriod
  const nextUpdate: CalculatorPeriod = nextPeriod(lastUpdated.month as string, lastUpdated.year as string)
  const nextReleaseMonth: number = (nextUpdate.month as number) === 12 ? 1 : (nextUpdate.month as number) + 1
  const nextPublishText: string = i18nLib.localize({
    key: 'calculatorNextPublishText',
    locale: language.code,
    values: [
      monthLabel(months, language.code, lastUpdated.month),
      lastUpdated.year as string,
      monthLabel(months, language.code, nextUpdate.month),
      monthLabel(months, language.code, nextReleaseMonth)
    ]
  })
  const lastNumberText: string = i18nLib.localize({
    key: 'calculatorLastNumber',
    locale: language.code,
    values: [
      monthLabel(months, language.code, lastUpdated.month),
      lastUpdated.year as string
    ]
  })
  const calculatorArticleUrl: string | undefined = partConfig.pifCalculatorArticle ? pageUrl({
    id: partConfig.pifCalculatorArticle
  }) : undefined

  const pifCalculator: React4xpObject = new React4xp('PifCalculator')
    .setProps({
      pifServiceUrl: serviceUrl({
        service: 'pif'
      }),
      language: language.code,
      months,
      phrases,
      nextPublishText,
      lastNumberText,
      lastUpdated,
      productGroups: productGroups(phrases),
      calculatorArticleUrl
    })
    .setId('pifCalculatorId')
    .uniqueId()

  const body: string = render(view, {
    pifCalculatorId: pifCalculator.react4xpId
  })
  return {
    body: pifCalculator.renderBody({
      body
    }),
    pageContributions: pifCalculator.renderPageContributions({})
  }
}

function lastPeriod(pifData: Dataset | null): CalculatorPeriod | undefined {
  // eslint-disable-next-line new-cap
  const pifDataDimension: Dimension | null = pifData && pifData.Dimension('Tid') as Dimension
  const dataTime: string | null | undefined = pifDataDimension && pifDataDimension.id

  if (dataTime) {
    const lastTimeItem: string = dataTime[dataTime.length - 1]
    const splitTime: Array<string> = lastTimeItem.split('M')

    const lastYear: string = splitTime[0]
    const lastMonth: string = splitTime[1]

    return {
      month: lastMonth,
      year: lastYear
    }
  }
  return
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

function monthLabel(months: MonthDropdownItems, language: string | undefined, month: number | string): string {
  const monthLabel: MonthDropdownItem | undefined = months.find((m) => parseInt(m.id) === parseInt(month as string))
  if (monthLabel) {
    return language && language === 'en' ? monthLabel.title : monthLabel.title.toLowerCase()
  }
  return ''
}

function allMonths(phrases: Phrases): MonthDropdownItems {
  return [
    {
      id: '',
      title: phrases.calculatorMonthAverage
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

function productGroups(phrases: Phrases): MonthDropdownItems {
  return [
    {
      id: 'SITCT',
      title: phrases.pifProductTypeAll
    },
    {
      id: 'SITC0',
      title: phrases.pifProductFood
    },
    {
      id: 'SITC1',
      title: phrases.pifProductBeverage
    },
    {
      id: 'SITC2',
      title: phrases.pifProductRaw
    },
    {
      id: 'SITC3',
      title: phrases.pifProductFuel
    },
    {
      id: 'SITC4',
      title: phrases.pifProductOil
    },
    {
      id: 'SITC5',
      title: phrases.pifProductChemical
    },
    {
      id: 'SITC6',
      title: phrases.pifProductManufactured
    },
    {
      id: 'SITC7',
      title: phrases.pifProductMachine
    },
    {
      id: 'SITC8',
      title: phrases.pifProductOther
    }
  ]
}
