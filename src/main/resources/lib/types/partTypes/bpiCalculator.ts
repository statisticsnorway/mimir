import { type CommonCalculatorProps } from '/lib/types/calculator'
import { type RadioGroupItems, type DropdownItems } from '/lib/types/components'

export type BpiCalculatorProps = CommonCalculatorProps & {
  bpiCalculatorServiceUrl: string
  dwellingTypeList: RadioGroupItems
  regionList: DropdownItems
  quarterPeriodList: DropdownItems
}
