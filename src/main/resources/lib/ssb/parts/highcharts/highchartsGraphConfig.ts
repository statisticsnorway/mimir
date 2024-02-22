import { Content } from '/lib/xp/content'
import { HighchartsGraphConfig } from '/lib/types/highcharts'
import { PreliminaryData } from '/lib/types/xmlParser'

import { createDefaultConfig } from '/lib/ssb/parts/highcharts/graph/config'
import { areaConfig } from '/lib/ssb/parts/highcharts/graph/graphAreaConfig'
import { pieConfig } from '/lib/ssb/parts/highcharts/graph/graphPieConfig'
import { barConfig } from '/lib/ssb/parts/highcharts/graph/graphBarConfig'
import { barNegativeConfig } from '/lib/ssb/parts/highcharts/graph/graphBarNegativeConfig'
import { columnConfig } from '/lib/ssb/parts/highcharts/graph/graphColumnConfig'
import { lineConfig } from '/lib/ssb/parts/highcharts/graph/graphLineConfig'
import { DataSource as DataSourceType } from '/lib/ssb/repo/dataset'
import { type DataSource } from '/site/mixins/dataSource'
import { type Highchart } from '/site/content-types'

export function prepareHighchartsGraphConfig(
  highchartContent: Content<Highchart>,
  dataFormat: DataSource['dataSource'],
  categories: Array<string | number | PreliminaryData> | undefined = undefined
): HighchartsGraphConfig {
  const isJsonStat: boolean =
    dataFormat !== undefined &&
    dataFormat._selected !== undefined &&
    dataFormat._selected === DataSourceType.STATBANK_API

  const options: GetGraphOptions = {
    isJsonStat,
    xAxisLabel:
      isJsonStat && dataFormat && dataFormat._selected === DataSourceType.STATBANK_API
        ? dataFormat['statbankApi'].xAxisLabel
        : undefined,
    categories,
  }
  return getGraphConfig(highchartContent, options)
}

function getGraphConfig(highchartContent: Content<Highchart>, options: GetGraphOptions): HighchartsGraphConfig {
  switch (highchartContent.data.graphType) {
    case 'area':
      return areaConfig(highchartContent, options)
    case 'bar':
      return barConfig(highchartContent, options)
    case 'barNegative':
      return barNegativeConfig(highchartContent, options)
    case 'column':
      return columnConfig(highchartContent, options)
    case 'line':
      return lineConfig(highchartContent, options)
    case 'pie':
      return pieConfig(highchartContent, options)
    default:
      return defaultConfig(highchartContent)
  }
}

function defaultConfig(highchartsContent: Content<Highchart>): HighchartsGraphConfig {
  return createDefaultConfig(highchartsContent.data, highchartsContent.displayName, highchartsContent.language)
}

interface GetGraphOptions {
  isJsonStat: boolean
  xAxisLabel: string | undefined
  categories: object | undefined
}
