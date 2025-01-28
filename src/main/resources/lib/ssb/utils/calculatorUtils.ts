import { quartersToMonths } from 'date-fns'
import { localize } from '/lib/xp/i18n'
import { type DropdownItems, type DropdownItem, type RadioGroupItems } from '/lib/types/components'
import { type CalculatorPeriod } from '/lib/types/calculator'
import { type Phrases } from '/lib/types/language'
import { type Data, type Dataset, type Dimension } from '/lib/types/jsonstat-toolkit'

interface CalculatorLastNumberText {
  language: string | undefined
  months: DropdownItems
  lastUpdatedMonth: string
  lastUpdatedYear: string
}

interface CalculatorNextPublishText extends CalculatorLastNumberText {
  nextUpdateMonth?: string
  nextPeriodText?: string
  nextReleaseMonth: string
}

export function nextPeriod(month: string, year: string): CalculatorPeriod {
  let nextPeriodMonth: number = parseInt(month) + 1
  let nextPeriodYear: number = parseInt(year)

  if (Number(month) === 12) {
    nextPeriodMonth = 1
    nextPeriodYear = nextPeriodYear + 1
  }

  return {
    month: nextPeriodMonth,
    year: nextPeriodYear,
  }
}

export function nextQuartalPeriod({ month, year }: CalculatorPeriod) {
  const nextQuartalMonth = Math.ceil(Number(month) + 3)
  const validNextQuartalMonth = nextQuartalMonth < 12 ? nextQuartalMonth : 1 // Ensures that january of next month is displayed correctly after calculation

  return {
    month: validNextQuartalMonth,
    year: nextQuartalMonth === 1 ? Number(year) + 1 : year, // January of next year
  }
}

// The quartersToMonths date-fns function picks the last month of the quarter so we have to do calculations to get the first month
function getFirstMonthofQuarterPeriod(quarter: string) {
  return quartersToMonths(Number(quarter)) - 3 + 1
}

export function lastQuartalPeriod(calculatorData: Dataset | null): CalculatorPeriod | undefined {
  const calculatorDataDimension: Dimension | null = calculatorData?.Dimension('Tid') as Dimension
  const dataTime: string | undefined = calculatorDataDimension?.id as string

  if (dataTime) {
    const lastTimeItem: string = dataTime[dataTime.length - 1]
    const [year, quarter]: Array<string> = lastTimeItem.split('K')

    return {
      month: getFirstMonthofQuarterPeriod(quarter),
      year,
    }
  }
}

export function allQuarterPeriods(quarterPhrase: string) {
  const quarterPeriodList = []
  let count = 1
  while (count <= 4) {
    quarterPeriodList.push({
      id: `K${count}`,
      title: `${quarterPhrase} ${count}`,
    })
    count++
  }
  return quarterPeriodList
}

export function allMonths(phrases: Phrases, frontPage?: boolean, type?: string): DropdownItems {
  const months: DropdownItems = [
    {
      id: '01',
      title: phrases.january,
    },
    {
      id: '02',
      title: phrases.february,
    },
    {
      id: '03',
      title: phrases.march,
    },
    {
      id: '04',
      title: phrases.april,
    },
    {
      id: '05',
      title: phrases.may,
    },
    {
      id: '06',
      title: phrases.june,
    },
    {
      id: '07',
      title: phrases.july,
    },
    {
      id: '08',
      title: phrases.august,
    },
    {
      id: '09',
      title: phrases.september,
    },
    {
      id: '10',
      title: phrases.october,
    },
    {
      id: '11',
      title: phrases.november,
    },
    {
      id: '12',
      title: phrases.december,
    },
  ]

  if (type !== 'husleie' && type !== 'bkibol') {
    const placeholderItem: DropdownItem = {
      id: '90',
      title: frontPage ? phrases.calculatorMonthAverageFrontpage : phrases.calculatorMonthAverage,
    }

    return [placeholderItem, ...months]
  }
  return months
}

export function monthLabel(months: DropdownItems, language: string | undefined, month: number | string): string {
  const monthLabel: DropdownItem | undefined = months.find((m) => parseInt(m.id) === parseInt(month as string))
  if (monthLabel) {
    return language === 'en' ? monthLabel.title : monthLabel.title.toLowerCase()
  }
  return ''
}

export function lastPeriodKpi(kpiDataMonth: Dataset | null): CalculatorPeriod {
  const kpiDataYearDimension: Dimension | null = kpiDataMonth?.Dimension('Tid') as Dimension
  const dataYear: string = kpiDataYearDimension?.id as string
  const kpiDataMonthDimension: Dimension | null = kpiDataMonth?.Dimension('Maaned') as Dimension
  const dataMonth: Array<string> = kpiDataMonthDimension?.id as Array<string>
  const lastYear: string = dataYear[dataYear.length - 1]
  const dataLastYearMnd: Array<string> = []

  dataMonth.forEach(function (month) {
    const kpiMonthData: Data | null = kpiDataMonth?.Data({
      Tid: lastYear,
      Maaned: month,
    }) as Data
    const verdi: Data['value'] = kpiMonthData?.value
    if (verdi != null) {
      dataLastYearMnd.push(month)
    }
  })
  const lastMonth: string = dataLastYearMnd[dataLastYearMnd.length - 1]

  return {
    month: lastMonth,
    year: lastYear,
  }
}

const seriesLocalizationMap = {
  ALT: 'bkibolWorkTypeAll',
  STEIN: 'bkibolWorkTypeStone',
  GRUNNARBEID: 'bkibolWorkTypeGroundwork',
  BYGGEARBEIDER: 'bkibolWorkTypeWithoutStone',
  TOMRING: 'bkibolWorkTypeCarpentry',
  MALING: 'bkibolWorkTypePainting',
  RORLEGGERARBEID: 'bkibolWorkTypePlumbing',
} as const

export type SeriesKey = keyof typeof seriesLocalizationMap

export function serieLocalization(language: string, series: SeriesKey): string {
  return localize({
    key: seriesLocalizationMap[series],
    locale: language,
    values: [],
  }) as string
}

export function allCategoryOptions(
  calculatorData: Dataset | null,
  category: string,
  phrases: Phrases,
  phrasesLabel: string,
  component: 'RadioGroup' | 'Dropdown'
) {
  const categoriesList: DropdownItems | RadioGroupItems = []
  const calculatorDataset = calculatorData?.Dimension(category) as Dimension
  const categoryIds = calculatorDataset?.id as Array<string>
  categoryIds?.map((categoryId) => {
    if (component === 'RadioGroup') {
      ;(categoriesList as RadioGroupItems).push({
        value: categoryId,
        label: phrases[`${phrasesLabel}.${category}.${categoryId}`],
      })
    }
    if (component === 'Dropdown') {
      ;(categoriesList as DropdownItems).push({
        id: categoryId,
        title: phrases[`${phrasesLabel}.${category}.${categoryId}`],
      })
    }
  })
  return categoriesList
}

export function getNextPublishText({
  language = 'nb',
  months,
  lastUpdatedMonth,
  lastUpdatedYear,
  nextUpdateMonth,
  nextPeriodText,
  nextReleaseMonth,
}: CalculatorNextPublishText) {
  return localize({
    key: 'calculatorNextPublishText',
    locale: language,
    values: [
      monthLabel(months, language, lastUpdatedMonth),
      lastUpdatedYear,
      nextPeriodText ?? monthLabel(months, language, nextUpdateMonth as string),
      monthLabel(months, language, nextReleaseMonth),
    ],
  })
}

export function getLastNumberText({
  language = 'nb',
  months,
  lastUpdatedMonth,
  lastUpdatedYear,
}: CalculatorLastNumberText) {
  return localize({
    key: 'calculatorLastNumber',
    locale: language,
    values: [monthLabel(months, language, lastUpdatedMonth), lastUpdatedYear],
  })
}
