import { type Accordion } from '/site/content-types'

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
  accordions: Array<Accordion>
  label: string
  ingress: string
}
