import { type AttachmentTablesFiguresData } from '/lib/types/partTypes/attachmentTablesFigures'

export interface StatisticFiguresProps {
  accordions: AttachmentTablesFiguresData[]
  freeText: string | undefined
  showAll: string
  showLess: string
  selectedFigures: string
  statbankBoxTitle: string
  statbankBoxText: string
  appName: string
  title: string
  icon: string
  iconStatbankBox: string
  statbankHref: string
}
