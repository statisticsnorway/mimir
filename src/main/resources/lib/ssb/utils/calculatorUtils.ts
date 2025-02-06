import { IndexResult, type CalculatorPeriod } from '/lib/types/calculator'
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

export function getMonthByQuarter(quarter: number | string) {
  switch (Number(quarter)) {
    case 1:
      return 1 // january
    case 2:
      return 4 // april
    case 3:
      return 7 // july
    case 4:
      return 10 // october
    default:
      break
  }
}
export function getPublishMonthByQuarter(quarter: number | string) {
  switch (Number(quarter)) {
    case 1:
      return 4 // april
    case 2:
      return 7 // july
    case 3:
      return 10 // october
    case 4:
      return 1 // january
    default:
      break
  }
}

export function nextQuarterPeriod({ quarter, year }: CalculatorPeriod) {
  const nextQuarter = (quarter as number) < 4 ? (quarter as number) + 1 : 1
  return {
    quarter: nextQuarter,
    month: getPublishMonthByQuarter(nextQuarter),
    year: (quarter as number) === 4 ? (Number(year) + 1).toString() : year, // January of next year
  }
}

export function lastQuarterPeriod(calculatorData: Dataset | null): CalculatorPeriod | undefined {
  const calculatorDataDimension: Dimension | null = calculatorData?.Dimension('Tid') as Dimension
  const dataTime: string | undefined = calculatorDataDimension?.id as string

  if (dataTime) {
    const lastTimeItem: string = dataTime[dataTime.length - 1]
    const [year, quarter]: Array<string> = lastTimeItem.split('K')

    return {
      quarter: Number(quarter),
      month: getMonthByQuarter(Number(quarter)),
      year,
    }
  }
}

// Extract number from e.g. "K1" for quarter periods
export function getQuarterNumber(quarterPeriod: string) {
  return quarterPeriod.substring(1)
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

export function isChronological(startYear: string, startMonth: string, endYear: string, endMonth: string): boolean {
  if (parseInt(startYear) < parseInt(endYear)) return true
  if (parseInt(endYear) < parseInt(startYear)) return false

  if (startMonth != '90' && startMonth != '' && endMonth != '' && endMonth != '90') {
    if (parseInt(startMonth) < parseInt(endMonth)) return true
    if (parseInt(startMonth) > parseInt(endMonth)) return false
  }
  return true
}

export function getChangeValue(startIndex: number, endIndex: number, chronological: boolean): number {
  if (chronological) {
    return (endIndex - startIndex) / startIndex
  } else {
    return (startIndex - endIndex) / endIndex
  }
}

export function getIndexTime(calculatorData: Dataset | null, categories: object): number | null {
  return calculatorData?.Data(categories)?.value as unknown as number
}

export function getPercentageFromChangeValue(changeValue: number) {
  return (changeValue * 100).toFixed(1)
}

export function getEndValue(startValue: string, indexResult: IndexResult) {
  return parseFloat(startValue) * ((indexResult.endIndex as number) / (indexResult.startIndex as number))
}
