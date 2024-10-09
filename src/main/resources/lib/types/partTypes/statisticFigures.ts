import { type AccordionData } from '/lib/types/partTypes/accordion'
import { type TableProps } from '/lib/types/partTypes/table'

export interface StatisticFiguresProps {
  accordions: StatisticFiguresData[]
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

export interface StatisticFiguresData extends AccordionData {
  contentType: string
  subHeader: string
  props?: TableProps | object
  pageContributions?: XP.PageContributions
}
