import { DropdownItems } from './components'
import { Phrases } from './language'

export interface CalculatorPeriod {
  quarter?: number
  month?: number | string
  year: number | string
}

export type CommonCalculatorProps = {
  language: string
  months: DropdownItems
  phrases: Phrases
  calculatorArticleUrl?: string
  nextPublishText: string
  lastNumberText: string
  lastUpdated: CalculatorPeriod
}

export interface IndexResult {
  startIndex: number | null
  endIndex: number | null
}
