export interface DropdownItem {
    id: string;
    title: string;
}

export type DropdownItems = Array<DropdownItem>

export interface Accordion {
  id: string,
  body: string | undefined,
  open: string,
  items: Array<AccordionItem>
}

export interface AccordionItem {
  title: string,
  body: string
}

