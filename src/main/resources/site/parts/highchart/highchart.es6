import JsonStat from 'jsonstat-toolkit'
import { X_AXIS_TITLE_POSITION, Y_AXIS_TITLE_POSITION } from '../../../lib/highcharts/config'
const util = __non_webpack_require__( '/lib/util')
const {
  getMunicipality
} = __non_webpack_require__( '/lib/klass/municipalities')
const {
  getDataSetWithDataQueryId
} = __non_webpack_require__( '/lib/ssb/dataset')
const {
  fromDatasetCache
} = __non_webpack_require__( '/lib/ssb/cache')
const {
  getComponent
} = __non_webpack_require__( '/lib/xp/portal')
const {
  render
} = __non_webpack_require__( '/lib/thymeleaf')
const {
  createConfig,
  lineColor,
  style
} = __non_webpack_require__('/lib/highcharts/config')
const {
  barNegativeFormat,
  defaultFormat,
  defaultTbmlFormat
} = __non_webpack_require__('/lib/highcharts/highcharts')
const {
  parseDataWithMunicipality
} = __non_webpack_require__('/lib/ssb/dataset')
const {
  renderError
} = __non_webpack_require__('/lib/error/error')
const {
  get: getDataquery
} = __non_webpack_require__( '/lib/ssb/dataquery')

const content = __non_webpack_require__( '/lib/xp/content')
const view = resolve('./highchart.html')

exports.get = function(req) {
  try {
    const part = getComponent()
    const highchartIds = part.config.highchart ? util.data.forceArray(part.config.highchart) : []
    return renderPart(req, highchartIds)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

exports.preview = (req, id) => renderPart(req, [id])

/**
 * @param {object} req
 * @param {array<string>} highchartIds
 * @return {{body: *, contentType: string}}
 */
function renderPart(req, highchartIds) {
  const highcharts = highchartIds.map((key) => {
    const highchart = content.get({
      key
    })

    let config
    if (highchart && highchart.data.dataquery) {
      const cachedQuery = fromDatasetCache(req, highchart.data.dataquery, () => {
        const dataQueryContent = getDataquery({
          key: highchart.data.dataquery
        })
        const datasetContent = getDataSetWithDataQueryId(highchart.data.dataquery).hits[0]
        let parsedData = JSON.parse(datasetContent.data.json)
        if (dataQueryContent.data.datasetFormat._selected === 'jsonStat') {
        // eslint-disable-next-line new-cap
          parsedData = JsonStat(parsedData).Dataset(0)
        }
        return {
          data: parsedData,
          format: dataQueryContent.data.datasetFormat
        }
      })
      const data = cachedQuery.data
      const datasetFormat = cachedQuery.format
      let filterOptions
      let xAxisLabel
      let yAxisLabel
      let usingJsonStat = false
      if (datasetFormat._selected === 'jsonStat') {
        const jsonStatConfig = datasetFormat.jsonStat
        filterOptions = jsonStatConfig.datasetFilterOptions
        xAxisLabel = jsonStatConfig.xAxisLabel
        yAxisLabel = jsonStatConfig.yAxisLabel
        usingJsonStat = true
      }

      const graphType = highchart.data.graphType
      const filterOnMunicipalities = filterOptions && filterOptions._selected && filterOptions._selected === 'municipalityFilter'
      let xAxisTitle = highchart.data.xAxisTitle
      config = createConfig(highchart.data, highchart.displayName)
      let graphData

      if (usingJsonStat) {
        // eslint-disable-next-line new-cap
        const dataset = data
        const dimensionFilter = dataset.id.map( () => 0 )

        if (filterOnMunicipalities) {
          const municipality = getMunicipality(req)
          xAxisTitle = municipality.displayName
          const filterTarget = filterOptions.municipalityFilter.municipalityDimension
          const filterTargetIndex = dataset.id.indexOf(filterTarget)
          dimensionFilter[filterTargetIndex] = parseDataWithMunicipality(dataset, filterTarget, municipality, xAxisLabel)
        }

        if (graphType === 'barNegative') {
          graphData = barNegativeFormat(dataset, dimensionFilter, xAxisLabel, yAxisLabel)
        } else {
          graphData = defaultFormat(dataset, dimensionFilter, xAxisLabel)
        }
      } else {
        graphData = defaultTbmlFormat(data, graphType, highchart.data.xAxisType)
      }

      if (graphType === 'barNegative') {
        // axes get flipped so interchange title positions
        config.series = graphData.series
        config.xAxis = {
          title: {
            ...config.xAxis.title,
            ...Y_AXIS_TITLE_POSITION
          },
          categories: graphData.categories,
          reversed: false,
          labels: {
            step: 1,
            style
          },
          lineColor,
          accessibility: {
            description: xAxisLabel
          }
        }
        config.yAxis.title = {
          ...config.yAxis.title,
          ...X_AXIS_TITLE_POSITION
        }
      } else {
        let useGraphDataCategories = false
        if (highchart.data.switchRowsAndColumns ||
            (!usingJsonStat && (
              graphType === 'line' ||
              graphType === 'column' ||
              graphType === 'area' ||
              graphType === 'bar'
            ))) {
          useGraphDataCategories = true
        }
        let showLabels = false
        if (graphType === 'line' ||
            graphType === 'area' ||
            highchart.data.switchRowsAndColumns ||
            (!usingJsonStat && (graphType === 'column' || graphType === 'bar'))) {
          showLabels = true
        }
        config.series = graphData.series

        config.xAxis = {
          categories: useGraphDataCategories ? graphData.categories : [highchart.displayName],
          gridLineWidth: graphType === 'line' ? 0 : 1,
          lineColor,
          tickInterval: highchart.data.tickInterval ? highchart.data.tickInterval.replace(/,/g, '.') : null,
          labels: {
            enabled: showLabels,
            style
          },
          max: highchart.data.xAxisMax ? highchart.data.xAxisMax.replace(/,/g, '.') : null,
          min: highchart.data.xAxisMin ? highchart.data.xAxisMin.replace(/,/g, '.') : null,
          // Confusing detail: when type=bar, X axis becomes Y and vice versa.
          // In other words, include 'bar' in this if-test, instead of putting it in the yAxis config
          tickmarkPlacement: (graphType == 'column' || graphType == 'bar') ? 'between' : 'on',
          title: {
            ...config.xAxis.title,
            text: xAxisTitle
          },
          type: highchart.data.xAxisType || 'categories',
          tickWidth: 1,
          tickColor: '#21383a'
        }

        if (graphType === 'bar') {
          // the axes get flipped, so interchange the title positions
          config.yAxis.title = {
            ...config.yAxis.title,
            ...X_AXIS_TITLE_POSITION
          }

          config.xAxis.title = {
            ...config.xAxis.title,
            ...Y_AXIS_TITLE_POSITION
          }
        }
      }

      if (!config.series) {
        config.data = {
          switchRowsAndColumns: highchart.data.switchRowsAndColumns,
          decimalPoint: ',',
          table: 'highcharts-datatable-' + highchart._id
        }
      }

      if (graphType === 'pie' || highchart.data.switchRowsAndColumns) {
        config.series = [{
          name: graphData.categories[0] && !usingJsonStat ? graphData.categories[0] : 'Antall',
          data: config.series.reduce((data, serie) => {
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
    } else if (highchart && highchart.data.htmlTable) {
      config = {
        ...createConfig(highchart.data, highchart.displayName),
        data: {
          table: 'highcharts-datatable-' + highchart._id,
          decimalPoint: ','
        }
      }
    }

    return initHighchart(highchart, config)
  })

  return {
    body: render(view, {
      highcharts
    }),
    contentType: 'text/html'
  }
}


function initHighchart(highchart, config) {
  const tableRegex = /<table[^>]*>/igm
  const nbspRegexp = /&nbsp;/igm
  const replace = '<table id="highcharts-datatable-' + highchart._id + '">'
  const resultWithId = highchart.data.htmlTable && highchart.data.htmlTable.replace(tableRegex, replace)
  const resultWithoutNbsp = resultWithId && resultWithId.replace(nbspRegexp, '')

  return {
    config: config,
    type: highchart.data.graphType,
    contentKey: highchart._id,
    footnoteText: highchart.data.footnoteText,
    creditsEnabled: (highchart.data.creditsHref || highchart.data.creditsText) ? true : false,
    creditsHref: highchart.data.creditsHref,
    creditsText: highchart.data.creditsText,
    tableData: resultWithoutNbsp,
    hideTitle: highchart.data.hideTitle
  }
}
