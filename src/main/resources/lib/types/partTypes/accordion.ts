import { type Accordion } from '/site/content-types/accordion'

export interface AccordionItems {
  title?: string
  body?: string
}

export interface AccordionData {
  id?: string
  body?: string | undefined
  open?: string | undefined
  items?: Accordion['accordions'] | AccordionItems
  subHeader?: string
}

export interface AccordionProps {
  accordions: AccordionData[]
}
