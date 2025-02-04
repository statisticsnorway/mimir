import { type Content } from '/lib/xp/content'
import { getContent, getComponent, serviceUrl } from '/lib/xp/portal'
import { type Dataset } from '/lib/types/jsonstat-toolkit'
import { type CalculatorPeriod } from '/lib/types/calculator'
import { type Phrases } from '/lib/types/language'
import { render } from '/lib/enonic/react4xp'
import { type DropdownItems } from '/lib/types/components'
import { lastQuartalPeriod, nextQuartalPeriod } from '/lib/ssb/utils/calculatorUtils'
import { renderError } from '/lib/ssb/error/error'
import { getLanguage } from '/lib/ssb/utils/language'
import { BPI_CALCULATOR, getCalculatorConfig, getCalculatorDatasetFromSource } from '/lib/ssb/dataset/calculator'
import {
  getNextPublishText,
  getLastNumberText,
  allMonths,
  allQuartalPeriods,
  allCategoryOptions,
} from '/lib/ssb/utils/calculatorLocalizationUtils'
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

  let bpiCalculator: XP.Response
  if (req.mode === 'edit' || req.mode === 'inline') {
    bpiCalculator = getBpiCalculatorComponent(req, page)
  } else {
    bpiCalculator = fromPartCache(req, `${page._id}-bpiCalculator`, () => {
      return getBpiCalculatorComponent(req, page)
    })
  }
  return bpiCalculator
}

function getBpiCalculatorComponent(req: XP.Request, page: Content<CalculatorConfig>): XP.Response {
  const config = getComponent<XP.PartComponent.BpiCalculator>()?.config
  if (!config) throw Error('No part found')

  const language = getLanguage(page as Content)
  const phrases = language?.phrases as Phrases
  const calculatorConfig: Content<CalculatorConfig> | undefined = getCalculatorConfig()
  const bpiDataset: Dataset | null = calculatorConfig
    ? getCalculatorDatasetFromSource(calculatorConfig, BPI_CALCULATOR)
    : null
  const months: DropdownItems = allMonths(phrases)
  const lastUpdated: CalculatorPeriod | undefined = lastQuartalPeriod(bpiDataset)
  const nextUpdate: CalculatorPeriod = nextQuartalPeriod({
    month: lastUpdated?.month as string,
    year: lastUpdated?.year as string,
  })
  const nextPublishText: string = getNextPublishText({
    language: language?.code,
    months,
    lastUpdatedMonth: lastUpdated?.month as string,
    lastUpdatedYear: lastUpdated?.year as string,
    nextPeriodText: phrases.calculatorNextQuartalPeriod,
    nextReleaseMonth: nextUpdate?.month as string,
  })
  const lastNumberText: string = getLastNumberText({
    language: language?.code,
    months,
    lastUpdatedMonth: lastUpdated?.month as string,
    lastUpdatedYear: lastUpdated?.year as string,
  })

  return render(
    'BpiCalculator',
    {
      bpiCalculatorServiceUrl: serviceUrl({
        service: 'bpiCalculator',
      }),
      language,
      phrases,
      months,
      lastUpdated,
      nextPublishText,
      lastNumberText,
      dwellingTypeList: allCategoryOptions(bpiDataset, 'Boligtype', phrases, 'bpiChooseDwellingType', 'RadioGroup'),
      regionList: allCategoryOptions(bpiDataset, 'Region', phrases, 'bpiChooseRegion', 'Dropdown'),
      quarterPeriodList: allQuartalPeriods(phrases.quarter),
    },
    req,
    {
      body: '<section class="xp-part bpi-calculator container"></section>',
    }
  )
}
