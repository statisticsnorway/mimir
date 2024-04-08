import { DropdownItems } from './components'
import { Phrases } from './language'

export interface CalculatorPeriod {
  month: number | string
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
