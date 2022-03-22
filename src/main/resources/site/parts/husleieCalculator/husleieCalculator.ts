import { Content } from 'enonic-types/content'
import { Request, Response } from 'enonic-types/controller'
import { allMonths, lastPeriodKpi, monthLabel, nextPeriod } from '../../../lib/ssb/utils/calculatorUtils'
import { CalculatorPeriod } from '../../../lib/types/calculator'
import { DropdownItems as MonthDropdownItems } from '../../../lib/types/components'
import { Dataset } from '../../../lib/types/jsonstat-toolkit'
import { Language, Phrases } from '../../../lib/types/language'
import { React4xp, React4xpObject, React4xpResponse } from '../../../lib/types/react4xp'
import { CalculatorConfig } from '../../content-types/calculatorConfig/calculatorConfig'
import { HusleieCalculatorPartConfig } from './husleieCalculator-part-config'

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
const i18nLib = __non_webpack_require__('/lib/xp/i18n')
const {
  fromPartCache
} = __non_webpack_require__('/lib/ssb/cache/partCache')

exports.get = function(req: Request): React4xpResponse | Response {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

exports.preview = (req: Request): React4xpResponse => renderPart(req)

function renderPart(req: Request): React4xpResponse {
  const page: Content = getContent()
  if (req.mode === 'edit') {
    return getHusleiekalkulator(req, page)
  } else {
    return fromPartCache(req, `${page._id}-husleieCalculator`, () => {
      return getHusleiekalkulator(req, page)
    })
  }
}

function getHusleiekalkulator(req: Request, page: Content): React4xpResponse {
  const config: HusleieCalculatorPartConfig = getComponent().config
  const language: Language = getLanguage(page)
  const phrases: Phrases = language.phrases as Phrases
  const calculatorConfig: Content<CalculatorConfig> | undefined = getCalculatorConfig()
  const kpiDataMonth: Dataset | null = getKpiDatasetMonth(calculatorConfig)
  const months: MonthDropdownItems = allMonths(phrases, false, 'husleie')
  const lastUpdated: CalculatorPeriod = lastPeriodKpi(kpiDataMonth)
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
  const calculatorArticleUrl: string | null | undefined = config.husleieCalculatorArticle && pageUrl({
    id: config.husleieCalculatorArticle
  })

  const husleieCalculator: React4xpObject = new React4xp('site/parts/husleieCalculator/husleieCalculator')
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
      lastUpdated
    })
    .setId('husleieCalculatorId')
    .uniqueId()


  return {
    body: husleieCalculator.renderBody(),
    pageContributions: husleieCalculator.renderPageContributions({
      clientRender: req.mode !== 'edit'
    })
  }
}
