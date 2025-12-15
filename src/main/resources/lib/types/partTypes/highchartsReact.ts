import { type HighchartsGraphConfig } from '/lib/types/highcharts'
import { type Phrases } from '/lib/types/language'
import { type Highchart } from '/site/content-types/highchart'

export interface HighchartProps {
  highcharts: HighchartsReactProps[]
  language: string
  phrases: Phrases | undefined
}

export interface HighchartsReactProps {
  config?: HighchartsExtendedProps
  description?: string
  type?: string
  contentKey?: string
  footnoteText?: string[]
  creditsEnabled?: boolean
  sourceList?: Highchart['sourceList']
  hideTitle?: boolean
}

export interface HighchartsReactExtraProps {
  draft?: boolean
  noDraftAvailable?: boolean
}

export type HighchartsExtendedProps = HighchartsGraphConfig & HighchartsReactExtraProps
