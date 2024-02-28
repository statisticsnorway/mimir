import { RowData } from '/lib/ssb/parts/highcharts/data/htmlTable'
import { Highmap } from '/site/content-types/highmap'
import { Phrases } from '../language'

export interface HighmapProps {
  title: string
  subtitle: Highmap['subtitle']
  description: Highmap['description']
  mapFile: object
  tableData: Array<HighmapFormattedTableData>
  thresholdValues: Array<ThresholdValues>
  hideTitle: Highmap['hideTitle']
  colorPalette: Highmap['colorPalette']
  numberDecimals: number | undefined
  heightAspectRatio: Highmap['heightAspectRatio']
  seriesTitle: Highmap['seriesTitle']
  legendTitle: Highmap['legendTitle']
  legendAlign: Highmap['legendAlign']
  sourceList?: Highmap['sourceList']
  footnoteText: Highmap['footnoteText']
  phrases: Phrases | undefined
  language: string | undefined
}

export interface HighmapFormattedTableData {
  capitalName: string
  value: number
}

export interface ThresholdValues {
  to: number | undefined
  from: number | undefined
}

export interface MapFeatures {
  properties: {
    name?: string
    capitalName?: string
  }
}

export interface MapResult {
  features: Array<MapFeatures>
}

export interface HighmapTable {
  table: {
    tbody: {
      tr: Array<RowData>
    }
  }
}
