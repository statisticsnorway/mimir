import { type AccordionData } from '/lib/types/partTypes/accordion'

export type AttachmentTablesFiguresProps = {
  accordions: AttachmentTablesFiguresData[]
  freeText: string | undefined
  showAll: string
  showLess: string
  appName: string
  title: string
}

export interface AttachmentTablesFiguresData extends AccordionData {
  contentType: string
  subHeader: string
  props?: object
  pageContributions?: XP.PageContributions
}
