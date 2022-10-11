import { HighchartsGraphConfig } from '../../../types/highcharts'
import { Highchart } from '../../../../site/content-types/highchart/highchart'
import { Content } from '/lib/xp/content'
import { DataSource } from '../../../../site/mixins/dataSource/dataSource'
import { PreliminaryData } from '../../../types/xmlParser'

const {
  createDefaultConfig
} = __non_webpack_require__('/lib/ssb/parts/highcharts/graph/config')
const {
  areaConfig
} = __non_webpack_require__('/lib/ssb/parts/highcharts/graph/graphAreaConfig')
const {
  pieConfig
} = __non_webpack_require__('/lib/ssb/parts/highcharts/graph/graphPieConfig')
const {
  barConfig
} = __non_webpack_require__('/lib/ssb/parts/highcharts/graph/graphBarConfig')
const {
  barNegativeConfig
} = __non_webpack_require__('/lib/ssb/parts/highcharts/graph/graphBarNegativeConfig')
const {
  columnConfig
} = __non_webpack_require__('/lib/ssb/parts/highcharts/graph/graphColumnConfig')
const {
  lineConfig
} = __non_webpack_require__('/lib/ssb/parts/highcharts/graph/graphLineConfig')
const {
  DataSource: DataSourceType
} = __non_webpack_require__('/lib/ssb/repo/dataset')

export function prepareHighchartsGraphConfig(
  highchartContent: Content<Highchart>,
  dataFormat: DataSource['dataSource'],
  categories: Array<string | number | PreliminaryData> | undefined = undefined): HighchartsGraphConfig {
  const isJsonStat: boolean = dataFormat !== undefined && dataFormat._selected !== undefined &&
    dataFormat._selected === DataSourceType.STATBANK_API

  const options: GetGraphOptions = {
    isJsonStat,
    xAxisLabel: isJsonStat && dataFormat && dataFormat._selected === DataSourceType.STATBANK_API ? dataFormat['statbankApi'].xAxisLabel : undefined,
    categories
  }
  return getGraphConfig(highchartContent, options)
}

function getGraphConfig<T>(highchartContent: Content<Highchart>, options: GetGraphOptions): HighchartsGraphConfig {
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
  isJsonStat: boolean;
  xAxisLabel: string | undefined;
  categories: object | undefined;
}

export interface HighchartsGraphConfigLib {
  prepareHighchartsGraphConfig: (
    highchartContent: Content<Highchart>,
    dataFormat: DataSource['dataSource'],
    categories?: Array<string | number | PreliminaryData>) => HighchartsGraphConfig;
}
