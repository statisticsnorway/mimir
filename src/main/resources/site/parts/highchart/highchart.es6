import JsonStat from 'jsonstat-toolkit'
const util = __non_webpack_require__( '/lib/util')
const { getMunicipality } = __non_webpack_require__( '/lib/klass/municipalities')
const { getDataSetWithDataQueryId } = __non_webpack_require__( '/lib/ssb/dataset')
const { getComponent } = __non_webpack_require__( '/lib/xp/portal')
const content = __non_webpack_require__( '/lib/xp/content')
const thymeleaf = __non_webpack_require__( '/lib/thymeleaf')
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

const { parseDataWithMunicipality } = __non_webpack_require__('/lib/ssb/dataset')
const view = resolve('./highchart.html')

exports.get = function(req) {
  const part = getComponent()
  const highchartIds = part.config.highchart ? util.data.forceArray(part.config.highchart) : []
  return renderPart(req, highchartIds)
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
      const datasetContent = getDataSetWithDataQueryId(highchart.data.dataquery).hits[0]
      let filterOptions
      let xAxisLabel
      let yAxisLabel
      const dataqueryContent = content.get({
        key: highchart.data.dataquery
      })
      let usingJsonStat = false
      if (dataqueryContent.data.datasetFormat && dataqueryContent.data.datasetFormat._selected === 'jsonStat') {
        const jsonStatConfig = dataqueryContent.data.datasetFormat.jsonStat
        filterOptions = jsonStatConfig.datasetFilterOptions
        xAxisLabel = jsonStatConfig.xAxisLabel
        yAxisLabel = jsonStatConfig.yAxisLabel
        usingJsonStat = true
      }

      let json
      try {
        json = JSON.parse(datasetContent.data.json)
      } catch (e) {
        log.error('Could not parse json ')
        log.error(e)
      }

      const graphType = highchart.data.graphType
      const filterOnMunicipalities = filterOptions && filterOptions._selected && filterOptions._selected === 'municipalityFilter'
      let xAxisTitle = highchart.data.xAxisTitle
      config = createConfig(highchart.data, highchart.displayName)
      let graphData

      if (usingJsonStat) {
        // eslint-disable-next-line new-cap
        const dataset = JsonStat(json).Dataset(0)
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
        graphData = defaultTbmlFormat(json)
      }

      if (graphType === 'barNegative') {
        config.series = graphData.series
        config.xAxis = {
          title: {
            style,
            text: xAxisTitle
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
      } else {
        let useGraphDataCategories = false
        if (highchart.data.switchRowsAndColumns || (!usingJsonStat && (graphType === 'line' || graphType === 'column'))) {
          useGraphDataCategories = true
        }
        let showLabels = false
        if (graphType === 'line' || graphType === 'area' || highchart.data.switchRowsAndColumns || (!usingJsonStat && (graphType === 'column'))) {
          showLabels = true
        }
        config.series = graphData.series
        config.xAxis = {
          categories: useGraphDataCategories ? graphData.categories : [highchart.displayName],
          allowDecimals: !!highchart.data.xAllowDecimal,
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
            style,
            text: xAxisTitle
          },
          type: highchart.data.xAxisType || 'categories',
          tickWidth: 1,
          tickColor: '#21383a'
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
          name: 'Antall',
          data: config.series.map((serie) => ({
            y: serie.y,
            name: serie.name
          }))
        }]
      }
    }
    return initHighchart(highchart, config)
  })

  return {
    body: thymeleaf.render(view, {
      highcharts
    }),
    contentType: 'text/html'
  }
}


function initHighchart(highchart, config, municipalityName) {
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
    tableData: resultWithoutNbsp
  }
}
