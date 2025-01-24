import { quartersToMonths } from 'date-fns'
import { type Content } from '/lib/xp/content'
import { getContent, getComponent } from '/lib/xp/portal'
import { localize } from '/lib/xp/i18n'
import { type Dataset, Category, Dimension } from '/lib/types/jsonstat-toolkit'
import { type CalculatorPeriod } from '/lib/types/calculator'
import { type Phrases } from '/lib/types/language'
import { render } from '/lib/enonic/react4xp'
import { type DropdownItems, type RadioGroupItems } from '/lib/types/components'
import { allMonths, monthLabel } from '/lib/ssb/utils/calculatorUtils'

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

// TODO: Add to part cache
function renderPart(req: XP.Request): XP.Response {
  const page = getContent<Content<CalculatorConfig>>()
  const config = getComponent<XP.PartComponent.BpiCalculator>()?.config
  if (!config) throw Error('No part found')

  const language = getLanguage(page as Content)
  const phrases = language?.phrases as Phrases
  const calculatorConfig: Content<CalculatorConfig> | undefined = getCalculatorConfig()
  const bpiDataset: Dataset | null = calculatorConfig
    ? getCalculatorDatasetFromSource(calculatorConfig, 'bpiCalculator')
    : null
  const months: DropdownItems = allMonths(phrases)
  const lastUpdated: CalculatorPeriod | undefined = lastQuartalPeriod(bpiDataset)
  const nextUpdate: CalculatorPeriod = nextQuartalPeriod({
    month: lastUpdated?.month as string,
    year: lastUpdated?.year as string,
  })
  const nextPublishText: string = localize({
    key: 'calculatorNextPublishText',
    locale: language?.code,
    values: [
      monthLabel(months, language?.code, lastUpdated?.month as string),
      lastUpdated?.year as string,
      phrases.bpiNextQuarterPeriod,
      monthLabel(months, language?.code, nextUpdate?.month),
    ],
  })
  const lastNumberText: string = localize({
    key: 'calculatorLastNumber',
    locale: language?.code,
    values: [monthLabel(months, language?.code, lastUpdated?.month as string), lastUpdated?.year as string],
  })

  return render(
    'BpiCalculator',
    {
      phrases,
      nextPublishText,
      lastNumberText,
      dwellingTypeList: listAllCategoryOptions(bpiDataset, 'Boligtype', 'RadioGroup'),
      regionList: listAllCategoryOptions(bpiDataset, 'Region'),
      quarterPeriodList: listAllQuarterPeriods(phrases.quarter),
    },
    req,
    {
      body: '<section class="xp-part bpi-calculator container"></section>',
    }
  )
}

function lastQuartalPeriod(bpiData: Dataset | null): CalculatorPeriod | undefined {
  const bpiDataDimension: Dimension | null = bpiData?.Dimension('Tid') as Dimension
  const dataTime: string | undefined = bpiDataDimension?.id as string

  if (dataTime) {
    const lastTimeItem: string = dataTime[dataTime.length - 1]
    const [year, quarters]: Array<string> = lastTimeItem.split('K')

    return {
      month: quartersToMonths(Number(quarters)) - 3 + 1, // Get the beginning month instead of the last month of the quarter
      year,
    }
  }
}

function nextQuartalPeriod({ month, year }: CalculatorPeriod) {
  const nextQuartalMonth = Math.ceil(Number(month) + 3)
  const validNextQuartalMonth = nextQuartalMonth < 12 ? nextQuartalMonth : 1 // Ensures that january of next month is displayed correctly after calculation

  return {
    month: validNextQuartalMonth,
    year: nextQuartalMonth === 1 ? Number(year) + 1 : year, // January of next year
  }
}

function listAllCategoryOptions(bpiData: Dataset | null, category: string, component?: string) {
  const categoriesList: DropdownItems | RadioGroupItems = []
  const bpiDataset = bpiData?.Dimension(category) as Dimension
  const categoryIds = bpiDataset?.id as Array<string>
  categoryIds?.map((categoryId) => {
    const categoryLabel = (bpiDataset?.Category(categoryId) as Category).label
    if (component === 'RadioGroup') {
      categoriesList.push({
        value: categoryId,
        label: categoryLabel,
      })
    } else {
      categoriesList.push({
        id: categoryId,
        title: categoryLabel,
      })
    }
  })
  return categoriesList
}

function listAllQuarterPeriods(quarterPhrase: string) {
  const quarterPeriodList = []
  for (let i = 1; i <= 4; i++) {
    quarterPeriodList.push({
      id: `K${i}`,
      title: `${quarterPhrase} ${i}`,
    })
  }
  return quarterPeriodList
}
