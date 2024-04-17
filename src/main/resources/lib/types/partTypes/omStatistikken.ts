import { type AccordionData } from './accordion'

export interface Items {
  definition: Array<string>
  administrativeInformation: Array<string>
  background: Array<string>
  production: Array<string>
  accuracyAndReliability: Array<string>
  aboutSeasonalAdjustment: Array<string>
}

export interface Category {
  [key: string]: string
}

export interface AboutTheStatisticsProps {
  accordions: Array<AccordionData>
  label: string
  ingress: string
}
