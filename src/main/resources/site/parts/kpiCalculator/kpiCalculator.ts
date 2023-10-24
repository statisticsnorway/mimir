import { type Content } from '/lib/xp/content'
import { getContent, getComponent, serviceUrl, pageUrl } from '/lib/xp/portal'
import { localize } from '/lib/xp/i18n'
import { type CalculatorPeriod } from '/lib/types/calculator'
import { type Dataset } from '/lib/types/jsonstat-toolkit'
import { type Phrases } from '/lib/types/language'
import { render } from '/lib/enonic/react4xp'
import { DropdownItems as MonthDropdownItems } from '/lib/types/components'
import { allMonths, lastPeriodKpi, monthLabel, nextPeriod } from '/lib/ssb/utils/calculatorUtils'

import { renderError } from '/lib/ssb/error/error'
import { getLanguage } from '/lib/ssb/utils/language'
import { getCalculatorConfig, getKpiDatasetMonth } from '/lib/ssb/dataset/calculator'
import { fromPartCache } from '/lib/ssb/cache/partCache'
import { type CalculatorConfig } from '/site/content-types'

export function get(req: XP.Request): XP.Response {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

export function preview(req: XP.Request) {
  return renderPart(req)
}

function renderPart(req: XP.Request): XP.Response {
  const page = getContent()
  if (!page) throw Error('No page found')

  let kpiCalculator: undefined
  if (req.mode === 'edit' || req.mode === 'inline') {
    kpiCalculator = getKpiCalculatorComponent(req, page)
  } else {
    kpiCalculator = fromPartCache(req, `${page._id}-kpiCalculator`, () => {
      return getKpiCalculatorComponent(req, page)
    })
  }

  return {
    body: ((kpiCalculator as unknown as XP.Response)?.body as string) || '',
    pageContributions: (kpiCalculator as unknown as XP.Response)?.pageContributions as XP.PageContributions,
  }
}

function getKpiCalculatorComponent(req: XP.Request, page: Content) {
  const config = getComponent<XP.PartComponent.KpiCalculator>()?.config
  if (!config) throw Error('No part found')

  const frontPage = !!config.frontPage
  const frontPageIngress: string | null | undefined = config.ingressFrontpage
  const language = getLanguage(page)
  const phrases = language?.phrases as Phrases
  const calculatorConfig: Content<CalculatorConfig> | undefined = getCalculatorConfig()
  const kpiDataMonth: Dataset | null = calculatorConfig ? getKpiDatasetMonth(calculatorConfig) : null
  const months: MonthDropdownItems = allMonths(phrases, frontPage)
  const lastUpdated: CalculatorPeriod = lastPeriodKpi(kpiDataMonth)
  const nextUpdate: CalculatorPeriod = nextPeriod(lastUpdated.month as string, lastUpdated.year as string)
  const nextReleaseMonth: number = (nextUpdate.month as number) === 12 ? 1 : (nextUpdate.month as number) + 1
  const nextPublishText: string = localize({
    key: 'calculatorNextPublishText',
    locale: language?.code,
    values: [
      monthLabel(months, language?.code, lastUpdated.month as string),
      lastUpdated.year as string,
      monthLabel(months, language?.code, nextUpdate.month as string),
      monthLabel(months, language?.code, nextReleaseMonth),
    ],
  })
  const lastNumberText: string = localize({
    key: 'calculatorLastNumber',
    locale: language?.code,
    values: [monthLabel(months, language?.code, lastUpdated.month as string), lastUpdated.year as string],
  })
  const calculatorArticleUrl: string | null | undefined =
    config.kpiCalculatorArticle &&
    pageUrl({
      id: config.kpiCalculatorArticle,
    })

  return render(
    'KpiCalculator',
    {
      kpiServiceUrl: serviceUrl({
        service: 'kpi',
      }),
      language: language?.code,
      months,
      phrases,
      calculatorArticleUrl,
      nextPublishText,
      lastNumberText,
      lastUpdated,
      frontPage,
      frontPageIngress,
    },
    req,
    {
      body: '<section class="xp-part part-kpi-calculator container"></section>',
    }
  )
}
