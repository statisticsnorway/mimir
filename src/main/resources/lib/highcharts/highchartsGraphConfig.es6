const {
  createDefaultConfig
} = __non_webpack_require__('/lib/highcharts/graph/config')
const {
  areaConfig
} = __non_webpack_require__( '/lib/highcharts/graph/graphAreaConfig')
const {
  pieConfig
} = __non_webpack_require__( '/lib/highcharts/graph/graphPieConfig')
const {
  barConfig
} = __non_webpack_require__( '/lib/highcharts/graph/graphBarConfig')
const {
  barNegativeConfig
} = __non_webpack_require__( '/lib/highcharts/graph/graphBarNegativeConfig')
const {
  columnConfig
} = __non_webpack_require__( '/lib/highcharts/graph/graphColumnConfig')
const {
  lineConfig
} = __non_webpack_require__( '/lib/highcharts/graph/graphLineConfig')
const {
  DataSource: DataSourceType
} = __non_webpack_require__( '../repo/dataset')

export function prepareHighchartsGraphConfig(highchartContent, dataFormat, categories = undefined) {
  const isJsonStat = dataFormat._selected && (dataFormat._selected === 'jsonStat' || dataFormat._selected === DataSourceType.STATBANK_API)
  const options = {
    isJsonStat,
    xAxisLabel: isJsonStat ? (dataFormat.jsonStat || dataFormat[DataSourceType.STATBANK_API]).xAxisLabel : undefined,
    categories
  }
  return getGraphConfig(highchartContent, options)
}

function getGraphConfig(highchartContent, categories, options) {
  switch (highchartContent.data.graphType) {
  case 'area':
    return areaConfig(highchartContent, categories, options)
  case 'bar':
    return barConfig(highchartContent, categories, options)
  case 'barNegative':
    return barNegativeConfig(highchartContent, categories, options)
  case 'column':
    return columnConfig(highchartContent, categories, options)
  case 'line':
    return lineConfig(highchartContent, categories, options)
  case 'pie':
    return pieConfig(highchartContent, categories, options)
  default:
    return defaultConfig(highchartContent, categories, options)
  }
}

function defaultConfig(highchartsContent) {
  return createDefaultConfig(highchartsContent.data, highchartsContent.displayName)
}
