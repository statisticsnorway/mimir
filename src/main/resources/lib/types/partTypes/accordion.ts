import { type Accordion } from '/site/content-types/accordion'

export interface AccordionData {
  id?: string
  body?: string | undefined
  open?: string | undefined
  items?: Accordion['accordions']
  subHeader?: string
}

export interface AccordionProps {
  accordions: Array<AccordionData>
}
