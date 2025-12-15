import { type Request, type Response } from '@enonic-types/core'
import { type Content } from '/lib/xp/content'
import { getComponent, getContent, serviceUrl, pageUrl } from '/lib/xp/portal'
import { localize } from '/lib/xp/i18n'
import { type CalculatorPeriod } from '/lib/types/calculator'
import { type DropdownItems as MonthDropdownItems } from '/lib/types/components'
import { type Dataset } from '/lib/types/jsonstat-toolkit'
import { type Phrases } from '/lib/types/language'
import { render } from '/lib/enonic/react4xp'
import { lastPeriodKpi, nextPeriod } from '/lib/ssb/utils/calculatorUtils'

import { renderError } from '/lib/ssb/error/error'
import { getLanguage } from '/lib/ssb/utils/language'
import { getCalculatorConfig, getKpiDatasetMonth } from '/lib/ssb/dataset/calculator'
import { fromPartCache } from '/lib/ssb/cache/partCache'
import { allMonths, getNextPublishText, monthLabel } from '/lib/ssb/utils/calculatorLocalizationUtils'

export function get(req: Request): Response {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

export function preview(req: Request) {
  return renderPart(req)
}

function renderPart(req: Request) {
  const page = getContent()
  if (!page) throw Error('No page found')

  if (req.mode === 'edit' || req.mode === 'inline') {
    return getHusleiekalkulator(req, page)
  } else {
    return fromPartCache(req, `${page._id}-husleieCalculator`, () => {
      return getHusleiekalkulator(req, page)
    })
  }
}

function getHusleiekalkulator(req: Request, page: Content) {
  const config = getComponent<XP.PartComponent.HusleieCalculator>()?.config
  if (!config) throw Error('No part found')

  const language = getLanguage(page)
  const phrases = language?.phrases as Phrases
  const calculatorConfig = getCalculatorConfig()
  const kpiDataMonth: Dataset | null = calculatorConfig ? getKpiDatasetMonth(calculatorConfig) : null
  const months: MonthDropdownItems = allMonths(phrases, false, 'husleie')
  const lastUpdated: CalculatorPeriod = lastPeriodKpi(kpiDataMonth)
  const nextUpdate: CalculatorPeriod = nextPeriod(lastUpdated.month as string, lastUpdated.year as string)
  const nextReleaseMonth: number = (nextUpdate.month as number) === 12 ? 1 : (nextUpdate.month as number) + 1
  const nextPublishText = getNextPublishText({
    language: language?.code,
    months,
    lastUpdatedMonth: lastUpdated?.month as string,
    lastUpdatedYear: lastUpdated?.year as string,
    nextUpdateMonth: nextUpdate.month as string,
    nextReleaseMonth,
  })
  const lastNumberText: string = localize({
    key: 'husleieLastNumber',
    locale: language?.code,
    values: [monthLabel(months, language?.code, lastUpdated.month as string | number), lastUpdated.year as string],
  })
  const calculatorArticleUrl: string | null | undefined =
    config.husleieCalculatorArticle &&
    pageUrl({
      id: config.husleieCalculatorArticle,
    })

  return render(
    'site/parts/husleieCalculator/husleieCalculator',
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
    },
    req
  )
}
