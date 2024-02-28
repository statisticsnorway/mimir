import { HighchartsGraphConfig } from '/lib/types/highcharts'
import { Highchart } from '/site/content-types/highchart'

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
