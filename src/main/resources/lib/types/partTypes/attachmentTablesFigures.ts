import { type TableProps } from '/lib/types/partTypes/table'
import { type AccordionData } from '/lib/types/partTypes/accordion'

export type AttachmentTablesFiguresProps = {
  accordions: AttachmentTablesFiguresData[]
  freeText: string | undefined
  showAll: string
  showLess: string
  appName: string
  title: string
  firstItemOpen?: boolean
}

export interface AttachmentTablesFiguresData extends AccordionData {
  contentType: string
  subHeader: string
  props?: TableProps | object
  pageContributions?: XP.PageContributions
}
