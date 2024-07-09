export interface AccordionData {
  id: string
  title?: string | undefined
  body?: string | undefined
  open?: string | undefined
  items?: Array<AccordionItems>
  subHeader?: string
}

export interface AccordionItems {
  title?: string | undefined
  body?: string | undefined
}

export interface AccordionProps {
  accordions: Array<AccordionData>
}
