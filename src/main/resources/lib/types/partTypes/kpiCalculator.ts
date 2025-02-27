import { CommonCalculatorProps } from '../calculator'

export type KpiCalculatorProps = CommonCalculatorProps & {
  kpiServiceUrl: string
  frontPage?: boolean
  frontPageIngress?: string
}
