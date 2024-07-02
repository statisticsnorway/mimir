import { type AccordionData } from '/lib/types/partTypes/accordion'

export interface StatisticFiguresProps {
  accordions: StatisticFiguresData[]
  freeText: string | undefined
  showAll: string
  showLess: string
  appName: string
  title: string
  icon: string
}

export interface StatisticFiguresData extends AccordionData {
  contentType: string
  subHeader: string
  props?: object
  pageContributions?: XP.PageContributions
}
