import { Accordion } from '/site/content-types/accordion'

export interface AccordionData {
  id?: string
  body?: string | undefined
  open?: string | undefined
  items?: Accordion['accordions']
}

export interface AccordionProp {
  accordions: Array<AccordionData>
}
