import { type AttachmentTablesFiguresProps } from '/lib/types/partTypes/attachmentTablesFigures'

export interface StatisticFiguresProps extends AttachmentTablesFiguresProps {
  selectedFigures: string
  statbankBoxTitle: string
  statbankBoxText: string
  icon: string
  iconStatbankBox: string
  statbankHref: string
}
