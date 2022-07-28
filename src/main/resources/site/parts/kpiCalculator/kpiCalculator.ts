import { Content } from '/lib/xp/content'
import { ResourceKey, render } from '/lib/thymeleaf'
import { allMonths, lastPeriodKpi, monthLabel, nextPeriod } from '../../../lib/ssb/utils/calculatorUtils'
import { CalculatorPeriod } from '../../../lib/types/calculator'
import { Dataset } from '../../../lib/types/jsonstat-toolkit'
import { Language, Phrases } from '../../../lib/types/language'
import { React4xp, React4xpObject, React4xpResponse } from '../../../lib/types/react4xp'
import { CalculatorConfig } from '../../content-types/calculatorConfig/calculatorConfig'
import { KpiCalculatorPartConfig } from './kpiCalculator-part-config'
import { DropdownItems as MonthDropdownItems } from '../../../lib/types/components'

const {
  getComponent,
  getContent,
  serviceUrl,
  pageUrl
} = __non_webpack_require__('/lib/xp/portal')

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

exports.get = function(req: XP.Request): XP.Response {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

exports.preview = function(req: XP.Request): XP.Response {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

function renderPart(req: XP.Request): XP.Response {
  const page: Content = getContent()
  let kpiCalculator: React4xpResponse | undefined
  if (req.mode === 'edit' || req.mode === 'inline') {
    kpiCalculator = getKpiCalculatorComponent(page)
  } else {
    kpiCalculator = fromPartCache(req, `${page._id}-kpiCalculator`, () => {
      return getKpiCalculatorComponent(page)
    })
  }

  return {
    body: kpiCalculator.body,
    pageContributions: kpiCalculator.pageContributions as XP.PageContributions
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
  const lastUpdated: CalculatorPeriod = lastPeriodKpi(kpiDataMonth)
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
