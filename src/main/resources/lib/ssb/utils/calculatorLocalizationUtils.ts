import { localize } from '/lib/xp/i18n'
import { type DropdownItems, type DropdownItem, type RadioGroupItems } from '/lib/types/components'
import { type Phrases } from '/lib/types/language'
import { type Dataset, type Dimension } from '/lib/types/jsonstat-toolkit'

interface CalculatorLastNumberText {
  language: string | undefined
  months: DropdownItems
  lastUpdatedPeriod?: string
  lastUpdatedMonth?: string
  lastUpdatedYear: string
}

interface CalculatorNextPublishText extends CalculatorLastNumberText {
  nextUpdateMonth?: string
  nextPeriodText?: string
  lastUpdatedYear: string
  nextUpdatedQuartal?: string
  nextUpdatedYear?: string
  date?: string
  nextReleaseMonth: string | number
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

export function getQuartalPeriodText(language = 'nb', quarter: number): string {
  return localize({
    key: 'calculatorNextQuartalPeriod',
    locale: language,
    values: [quarter?.toString() as string],
  })
}

export function getNextPublishText({
  language = 'nb',
  months,
  lastUpdatedMonth,
  lastUpdatedYear,
  nextUpdateMonth,
  date = '10',
  nextReleaseMonth,
}: CalculatorNextPublishText) {
  return localize({
    key: 'calculatorNextPublishText',
    locale: language,
    values: [
      monthLabel(months, language, lastUpdatedMonth as string),
      lastUpdatedYear,
      monthLabel(months, language, nextUpdateMonth as string),
      date,
      monthLabel(months, language, nextReleaseMonth),
    ],
  })
}

export function getLastNumberText({
  language = 'nb',
  months,
  lastUpdatedPeriod,
  lastUpdatedMonth,
  lastUpdatedYear,
}: CalculatorLastNumberText) {
  return localize({
    key: 'calculatorLastNumber',
    locale: language,
    values: [lastUpdatedPeriod ?? monthLabel(months, language, lastUpdatedMonth as string), lastUpdatedYear],
  })
}

export function getNextQuartalPublishText({
  language = 'nb',
  months,
  lastUpdatedPeriod,
  lastUpdatedYear,
  nextUpdatedQuartal,
  nextUpdatedYear,
  date,
  nextReleaseMonth,
}: CalculatorNextPublishText) {
  return localize({
    key: 'calculatorNextQuartalPublishText',
    locale: language,
    values: [
      lastUpdatedPeriod as string,
      lastUpdatedYear,
      nextUpdatedQuartal as string,
      nextUpdatedYear as string,
      date as string,
      monthLabel(months, language, nextReleaseMonth),
    ],
  })
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

export function allQuartalPeriods(quarterPhrase: string) {
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
