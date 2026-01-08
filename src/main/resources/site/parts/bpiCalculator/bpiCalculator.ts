import { type Request, type Response } from '@enonic-types/core'
import { type Content } from '/lib/xp/content'
import { getContent, getComponent, serviceUrl } from '/lib/xp/portal'
import { type Dataset } from '/lib/types/jsonstat-toolkit'
import { type CalculatorPeriod } from '/lib/types/calculator'
import { type Phrases } from '/lib/types/language'
import { render } from '/lib/enonic/react4xp'
import { type DropdownItems } from '/lib/types/components'
import { lastQuarterPeriod, nextQuarterPeriod } from '/lib/ssb/utils/calculatorUtils'
import { renderError } from '/lib/ssb/error/error'
import { getLanguage } from '/lib/ssb/utils/language'
import { BPI_CALCULATOR, getCalculatorConfig, getCalculatorDatasetFromSource } from '/lib/ssb/dataset/calculator'
import {
  getNextQuarterPublishText,
  getLastNumberText,
  allMonths,
  allQuarterPeriods,
  allCategoryOptions,
  getQuarterPeriodText,
} from '/lib/ssb/utils/calculatorLocalizationUtils'
import { fromPartCache } from '/lib/ssb/cache/partCache'
import { type CalculatorConfig } from '/site/content-types'

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

function renderPart(req: Request): Response {
  const page = getContent()
  if (!page) throw Error('No page found')

  let bpiCalculator: Response
  if (req.mode === 'edit' || req.mode === 'inline') {
    bpiCalculator = getBpiCalculatorComponent(req, page)
  } else {
    bpiCalculator = fromPartCache(req, `${page._id}-bpiCalculator`, () => {
      return getBpiCalculatorComponent(req, page)
    })
  }
  return bpiCalculator
}

function getBpiCalculatorComponent(req: Request, page: Content<CalculatorConfig>): Response {
  const config = getComponent<XP.PartComponent.BpiCalculator>()?.config
  if (!config) throw Error('No part found')

  const language = getLanguage(page as Content)
  const languageCode = language?.code
  const phrases = language?.phrases as Phrases
  const calculatorConfig: Content<CalculatorConfig> | undefined = getCalculatorConfig()
  const bpiDataset: Dataset | null = calculatorConfig
    ? getCalculatorDatasetFromSource(calculatorConfig, BPI_CALCULATOR)
    : null
  const months: DropdownItems = allMonths(phrases)
  const lastUpdated: CalculatorPeriod | undefined = lastQuarterPeriod(bpiDataset)
  const nextUpdate: CalculatorPeriod = nextQuarterPeriod({
    quarter: lastUpdated?.quarter,
    month: lastUpdated?.month as string,
    year: lastUpdated?.year as string,
  })

  return render(
    'BpiCalculator',
    {
      bpiCalculatorServiceUrl: serviceUrl({
        service: 'bpiCalculator',
      }),
      language: languageCode,
      phrases,
      months,
      lastUpdated,
      nextPublishText: getNextQuarterPublishText({
        language: languageCode,
        months,
        lastUpdatedPeriod: getQuarterPeriodText(languageCode, lastUpdated?.quarter as number),
        lastUpdatedYear: lastUpdated?.year as string,
        nextUpdatedQuarter: getQuarterPeriodText(languageCode, nextUpdate?.quarter as number),
        nextUpdatedYear: nextUpdate?.year as string,
        date: '13',
        nextReleaseMonth: nextUpdate?.month as string,
      }),
      lastNumberText: getLastNumberText({
        language: languageCode,
        months,
        lastUpdatedPeriod: getQuarterPeriodText(languageCode, lastUpdated?.quarter as number),
        lastUpdatedYear: lastUpdated?.year as string,
      }),
      dwellingTypeList: allCategoryOptions(bpiDataset, 'Boligtype', phrases, 'bpiChooseDwellingType', 'RadioGroup'),
      regionList: allCategoryOptions(bpiDataset, 'Region', phrases, 'bpiChooseRegion', 'Dropdown'),
      quarterPeriodList: allQuarterPeriods(phrases.quarter),
    },
    req,
    {
      body: '<section class="xp-part bpi-calculator container"></section>',
    }
  )
}
