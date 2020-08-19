const {areaConfig} = __non_webpack_require__( '/lib/highcharts/graphAreaConfig')
const {pieConfig} = __non_webpack_require__( '/lib/highcharts/graphPieConfig')
const {barNegativeConfig} = __non_webpack_require__( '/lib/highcharts/graphBarNegative')
const {columnConfig} = __non_webpack_require__( '/lib/highcharts/graphColumnConfig')
const {lineConfig} = __non_webpack_require__( '/lib/highcharts/graphLineConfig')
const {defaultConfig} = __non_webpack_require__( '/lib/highcharts/graphDefault')
const {
  mergeDeepRight
} = require('ramda')
const {
  DataSource: DataSourceType
} = __non_webpack_require__( '../repo/dataset')
const {
  getMunicipality
} = __non_webpack_require__( '/lib/klass/municipalities')
const {
  barNegativeFormat,
  defaultFormat,
  defaultTbmlFormat
} = __non_webpack_require__('/lib/highcharts/highcharts')

const {
  parseDataWithMunicipality
} = __non_webpack_require__('/lib/ssb/dataset')

export function prepareHighchartsGraphConfig(highchartContent, highchartData, isJsonStat, datasetFormat) {

  const options = {
    isJsonStat,
    xAxisLabel: isJsonStat ? (datasetFormat.jsonStat || datasetFormat[DataSourceType.STATBANK_API]).xAxisLabel : undefined
  }
  const graphConfig = getGraphConfig(highchartContent, highchartData.data, options)
  return mergeDeepRight(graphConfig, highchartData.series)
}

function getGraphConfig(highchartContent, categories, options) {
  switch(highchartContent.data.graphType) {
    case 'area':
      return areaConfig(highchartContent,categories, options)
    case 'bar':
      return pieConfig(highchartContent,categories, options)
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

export function prepareHighchartsData(req, highchartContent, dataset, datasetFormat) {
  const isJsonStat = datasetFormat._selected === 'jsonStat' || datasetFormat._selected === DataSourceType.STATBANK_API
  const seriesAndCategories = isJsonStat ?
    parseJsonStatData(req, highchartContent, dataset, datasetFormat) :
    defaultTbmlFormat(dataset, highchartContent.data.graphType, highchartContent.data.xAxisType)

  return (highchartContent.data.graphType === 'pie' || highchartContent.data.switchRowsAndColumns) ?
    switchRowsAndColumns(seriesAndCategories, isJsonStat) : seriesAndCategories
}

function switchRowsAndColumns(seriesAndCategories, isJsonStat) {
  return {
    categories: seriesAndCategories.categories,
    series: [{
      name: seriesAndCategories.categories[0] && !isJsonStat ? seriesAndCategories.categories[0] : 'Antall',
      data: seriesAndCategories.series.reduce((data, serie) => {
        if (serie.y != null) {
          data.push({
            y: serie.y,
            name: serie.name
          })
        }
        return data
      }, [])
    }]
  }
}

function parseJsonStatData(req, highchart, dataset, datasetFormat) {
  const jsonStatConfig = datasetFormat.jsonStat || datasetFormat[DataSourceType.STATBANK_API]
  const filterOptions = jsonStatConfig.datasetFilterOptions
  const xAxisLabel = jsonStatConfig.xAxisLabel
  const yAxisLabel = jsonStatConfig.yAxisLabel
  const dimensionFilter = dataset && dataset.id.map( () => 0 )

  if (filterOptions && filterOptions._selected && filterOptions._selected === 'municipalityFilter') {
    const municipality = getMunicipality(req)
    const filterTarget = filterOptions.municipalityFilter.municipalityDimension
    const filterTargetIndex = dataset && dataset.id.indexOf(filterTarget)
    dimensionFilter[filterTargetIndex] = parseDataWithMunicipality(dataset, filterTarget, municipality, xAxisLabel)
  }

  if (highchart.data.graphType === 'barNegative') {
    return barNegativeFormat(dataset, dimensionFilter, xAxisLabel, yAxisLabel)
  } else {
    return defaultFormat(dataset, dimensionFilter, xAxisLabel)
  }
}
