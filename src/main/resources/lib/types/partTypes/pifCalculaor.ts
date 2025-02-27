import { CommonCalculatorProps } from '../calculator'
import { DropdownItems } from '../components'

export type PifCalculatorProps = CommonCalculatorProps & {
  pifServiceUrl: string
  productGroups: DropdownItems
}
