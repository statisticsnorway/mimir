import { localize } from '/lib/xp/i18n'
import { type DropdownItem as MonthDropdownItem, type DropdownItems as MonthDropdownItems } from '/lib/types/components'
import { type CalculatorPeriod } from '/lib/types/calculator'
import { type Phrases } from '/lib/types/language'
import { type Data, type Dataset, type Dimension } from '/lib/types/jsonstat-toolkit'

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

export function allMonths(phrases: Phrases, frontPage?: boolean, type?: string): MonthDropdownItems {
  const months: MonthDropdownItems = [
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
    const placeholderItem: MonthDropdownItem = {
      id: '90',
      title: frontPage ? phrases.calculatorMonthAverageFrontpage : phrases.calculatorMonthAverage,
    }

    return [placeholderItem, ...months]
  }
  return months
}

export function monthLabel(months: MonthDropdownItems, language: string | undefined, month: number | string): string {
  const monthLabel: MonthDropdownItem | undefined = months.find((m) => parseInt(m.id) === parseInt(month as string))
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
