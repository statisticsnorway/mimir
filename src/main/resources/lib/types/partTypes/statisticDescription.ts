import { type AccordionData } from '/lib/types/partTypes/accordion'

export interface StatisticDescriptionProps {
  ingress: string
  label: string
  lastUpdatedPhrase: string
  lastUpdated: string
  accordions: Array<AccordionData>
}
