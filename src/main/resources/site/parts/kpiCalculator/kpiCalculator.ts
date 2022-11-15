import type {Content} from '/lib/xp/content'
import {allMonths, lastPeriodKpi, monthLabel, nextPeriod} from '../../../lib/ssb/utils/calculatorUtils'
import type {CalculatorPeriod} from '../../../lib/types/calculator'
import type {Dataset} from '../../../lib/types/jsonstat-toolkit'
import type {Language, Phrases} from '../../../lib/types/language'
import {render, type RenderResponse} from '/lib/enonic/react4xp'
import type {CalculatorConfig} from '../../content-types/calculatorConfig/calculatorConfig'
import type {KpiCalculatorPartConfig} from './kpiCalculator-part-config'
import {DropdownItems as MonthDropdownItems} from '../../../lib/types/components'
import {getContent, getComponent, serviceUrl, pageUrl} from '/lib/xp/portal'
import {localize} from '/lib/xp/i18n'

const {
  renderError
} = __non_webpack_require__('/lib/ssb/error/error')

const {
  getLanguage
} = __non_webpack_require__('/lib/ssb/utils/language')
const {
  getCalculatorConfig, getKpiDatasetMonth
} = __non_webpack_require__('/lib/ssb/dataset/calculator')
const {
  fromPartCache
} = __non_webpack_require__('/lib/ssb/cache/partCache')


export function get(req: XP.Request): XP.Response {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

export function preview(req: XP.Request): XP.Response {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

function renderPart(req: XP.Request): XP.Response {
  const page: Content = getContent()
  let kpiCalculator: RenderResponse | undefined
  if (req.mode === 'edit' || req.mode === 'inline') {
    kpiCalculator = getKpiCalculatorComponent(req, page)
  } else {
    kpiCalculator = fromPartCache(req, `${page._id}-kpiCalculator`, () => {
      return getKpiCalculatorComponent(req, page)
    })
  }

  return {
    body: kpiCalculator.body,
    pageContributions: kpiCalculator.pageContributions as XP.PageContributions
  }
}

function getKpiCalculatorComponent(req: XP.Request, page: Content): RenderResponse {
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
  const nextPublishText: string = localize({
    key: 'calculatorNextPublishText',
    locale: language.code,
    values: [
      monthLabel(months, language.code, lastUpdated.month as string),
      lastUpdated.year as string,
      monthLabel(months, language.code, nextUpdate.month as string),
      monthLabel(months, language.code, nextReleaseMonth)
    ]
  })
  const lastNumberText: string = localize({
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

  return render('KpiCalculator',
    {
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
    },
    req,
    {
      body: '<section class="xp-part part-kpi-calculator container"></section>'
    })
}
