import { type Content } from '/lib/xp/content'
import { getContent, getComponent } from '/lib/xp/portal'
import { localize } from '/lib/xp/i18n'
import { Dataset } from '/lib/types/jsonstat-toolkit'
import { type CalculatorPeriod } from '/lib/types/calculator'
import { type Phrases } from '/lib/types/language'
import { render } from '/lib/enonic/react4xp'
import { type DropdownItems as MonthDropdownItems } from '/lib/types/components'
import { allMonths, lastPeriodKpi, monthLabel, nextPeriod } from '/lib/ssb/utils/calculatorUtils'

import { renderError } from '/lib/ssb/error/error'
import { getLanguage } from '/lib/ssb/utils/language'
import { getCalculatorConfig, getCalculatorDatasetFromSource } from '/lib/ssb/dataset/calculator'
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
  const config = getComponent<XP.PartComponent.BpiCalculator>()?.config
  if (!config) throw Error('No part found')

  const language = getLanguage(page)
  const phrases = language?.phrases as Phrases
  const calculatorConfig: Content<CalculatorConfig> | undefined = getCalculatorConfig()
  const bpiDataset: Dataset | null = calculatorConfig
    ? getCalculatorDatasetFromSource(calculatorConfig, 'bpiCalculator')
    : null
  const months: MonthDropdownItems = allMonths(phrases)
  const lastUpdated: CalculatorPeriod = lastPeriodKpi(bpiDataset)
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

  return render(
    'BpiCalculator',
    {
      nextPublishText,
      lastNumberText,
    },
    req,
    {
      body: '<section class="xp-part bpi-calculator container"></section>',
    }
  )
}
