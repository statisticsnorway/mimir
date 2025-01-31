import { quartersToMonths } from 'date-fns'
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

export function nextQuartalPeriod({ month, year }: CalculatorPeriod) {
  const nextQuartalMonth = Math.ceil(Number(month) + 3)
  const validNextQuartalMonth = nextQuartalMonth < 12 ? nextQuartalMonth : 1 // Ensures that january of next month is displayed correctly after calculation

  return {
    month: validNextQuartalMonth,
    year: nextQuartalMonth === 1 ? Number(year) + 1 : year, // January of next year
  }
}

// The quartersToMonths date-fns function picks the last month of the quarter so we have to do calculations to get the first month
export function getFirstMonthofQuartalPeriod(quarter: string) {
  return quartersToMonths(Number(quarter)) - 3 + 1
}

export function lastQuartalPeriod(calculatorData: Dataset | null): CalculatorPeriod | undefined {
  const calculatorDataDimension: Dimension | null = calculatorData?.Dimension('Tid') as Dimension
  const dataTime: string | undefined = calculatorDataDimension?.id as string

  if (dataTime) {
    const lastTimeItem: string = dataTime[dataTime.length - 1]
    const [year, quarter]: Array<string> = lastTimeItem.split('K')

    return {
      month: getFirstMonthofQuartalPeriod(quarter),
      year,
    }
  }
}

// Extract number from e.g. "K1" for quartal periods
export function getQuartalNumber(quartalPeriod: string) {
  return quartalPeriod.substring(1)
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
