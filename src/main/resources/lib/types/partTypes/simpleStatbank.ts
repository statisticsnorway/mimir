import { type SimpleStatbankResult } from '/lib/ssb/parts/simpleStatbank'

export interface SimpleStatbankProps {
  icon: string
  altText: string | undefined
  title: string
  ingress: string
  labelDropdown: string
  placeholderDropdown: string
  displayDropdown: string
  resultText: string
  unit: string
  timeLabel: string
  resultFooter: string
  noNumberText: string
  closeText: string
  statbankApiData: SimpleStatbankResult | undefined
}
