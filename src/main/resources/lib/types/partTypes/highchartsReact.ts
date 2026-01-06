import { Options as HighchartsGraphConfig } from 'highcharts'
import { type Phrases } from '/lib/types/language'
import { type Highchart } from '/site/content-types/highchart'

export interface HighchartsReactProps {
  highcharts: HighchartsPartProps[]
  language: string
  phrases?: Phrases
}

export interface HighchartsPartProps {
  config?: HighchartsExtendedProps
  description?: string
  type?: string
  contentKey?: string
  footnoteText?: string[]
  creditsEnabled?: boolean
  sourceList?: Highchart['sourceList']
  hideTitle?: boolean
}

export interface HighchartsExtraPartProps {
  draft?: boolean
  noDraftAvailable?: boolean
}

export type HighchartsExtendedProps = HighchartsGraphConfig & HighchartsExtraPartProps
