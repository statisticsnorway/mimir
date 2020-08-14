const { X_AXIS_TITLE_POSITION, Y_AXIS_TITLE_POSITION } = __non_webpack_require__( './config')

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
const {
  createConfig,
  lineColor,
  style
} = __non_webpack_require__('/lib/highcharts/config')


export function prepareHighchartsGraphConfig(highchartContent, highchartData, isJsonStat, datasetFormat) {
  const config = createConfig(highchartContent.data, highchartContent.displayName)
  const graphType = highchartContent.data.graphType

  const axisConfig = {
    graphType,
    highchartContent,
    config,
    categories: highchartData.data,
    xAxisLabel: isJsonStat ? (datasetFormat.jsonStat || datasetFormat[DataSourceType.STATBANK_API]).xAxisLabel : undefined,
    showLabels: determineShowLabels(graphType, highchartContent.data.switchRowsAndColumns, isJsonStat),
    useGraphDataCategories: determineUseGraphsDataCategories(graphType, highchartContent.data.switchRowsAndColumns, isJsonStat)
  }

  config.series = highchartData.series
  config.xAxis = prepareXAxis(axisConfig)
  if (graphType === 'barNegative' || graphType === 'bar') config.yAxis = prepareYAxis(axisConfig)

  return config
}

function determineUseGraphsDataCategories(graphType, switchRowsAndColumns, isJsonStat) {
  return (switchRowsAndColumns ||
          (!isJsonStat && (
            graphType === 'line' ||
            graphType === 'column' ||
            graphType === 'area' ||
            graphType === 'bar'
          )))
}

function determineShowLabels(graphType, switchRowsAndColumns, isJsonStat) {
  return (graphType === 'line' ||
          graphType === 'area' ||
          switchRowsAndColumns ||
          (!isJsonStat && (graphType === 'column' || graphType === 'bar')))
}

function prepareYAxis(axisConfig) {
  return {
    title: {
      ...axisConfig.config.yAxis.title,
      ...X_AXIS_TITLE_POSITION
    }
  }
}


function prepareXAxis(xAxisConfig) {
  if (xAxisConfig.graphType === 'barNegative') {
    return {
      title: {
        ...xAxisConfig.config.xAxis.title,
        ...Y_AXIS_TITLE_POSITION
      },
      categories: xAxisConfig.categories,
      reversed: false,
      labels: {
        step: 1,
        style
      },
      lineColor,
      accessibility: {
        description: xAxisConfig.xAxisLabel
      }
    }
  } else {
    const highchartContent = xAxisConfig.highchartContent
    return {
      categories: xAxisConfig.useGraphDataCategories ? xAxisConfig.categories : [highchartContent.displayName],
      gridLineWidth: xAxisConfig.graphType === 'line' ? 0 : 1,
      lineColor,
      tickInterval: highchartContent.data.tickInterval ? highchartContent.data.tickInterval.replace(/,/g, '.') : null,
      labels: {
        enabled: xAxisConfig.showLabels,
        style
      },
      max: highchartContent.data.xAxisMax ? highchartContent.data.xAxisMax.replace(/,/g, '.') : null,
      min: highchartContent.data.xAxisMin ? highchartContent.data.xAxisMin.replace(/,/g, '.') : null,
      // Confusing detail: when type=bar, X axis becomes Y and vice versa.
      // In other words, include 'bar' in this if-test, instead of putting it in the yAxis config
      tickmarkPlacement: (xAxisConfig.graphType == 'column' || xAxisConfig.graphType == 'bar') ? 'between' : 'on',
      title: xAxisConfig.graphType === 'bar' ? {
        ...xAxisConfig.config.xAxis.title,
        ...Y_AXIS_TITLE_POSITION
      } : {
        ...xAxisConfig.config.xAxis.title,
        text: highchartContent.data.xAxisTitle // if municipality xAxisTitle = municipality.displayName
      },
      type: highchartContent.data.xAxisType || 'categories',
      tickWidth: 1,
      tickColor: '#21383a'

    }
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
