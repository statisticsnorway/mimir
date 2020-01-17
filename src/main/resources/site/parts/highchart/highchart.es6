const util = __non_webpack_require__( '/lib/util')
const { getMunicipality } = __non_webpack_require__( '/lib/klass/municipalities')
const { getDataSetWithDataQueryId } = __non_webpack_require__( '/lib/ssb/dataset')
const { getComponent, getSiteConfig } = __non_webpack_require__( '/lib/xp/portal')
const content = __non_webpack_require__( '/lib/xp/content')
const thymeleaf = __non_webpack_require__( '/lib/thymeleaf')
import JsonStat from 'jsonstat-toolkit'
const { createSetOptions, createConfig, lineColor, style } = __non_webpack_require__('/lib/highcharts/config')
const { parseDataWithMunicipality, barNegativeFormat, defaultFormat } = __non_webpack_require__('/lib/highcharts/highcharts')

const view = resolve('./highchart.html')

exports.get = function(req) {
  const part = getComponent()
  const highchartIds = part.config.highchart ? util.data.forceArray(part.config.highchart) : []
  return renderPart(req, highchartIds)
}

exports.preview = (req, id) => renderPart(req, [id])


/**
 *
 * @param {} req
 * @param {} highchartIds
 * @returns {{body: *, contentType: string}}
 */
function renderPart(req, highchartIds) {
  const highcharts = highchartIds.map((key) => {
    const highchart = content.get({ key });

    let config;
    if (highchart && highchart.data.dataquery) {
      const filterOptions = highchart.data.datasetFilterOptions
      const datasetContent = getDataSetWithDataQueryId(highchart.data.dataquery).hits[0]
      let json;
      try {
        json = JSON.parse(datasetContent.data.json);
      } catch (e) {
        log.error('Could not parse json ')
        log.error(e)
      }

      const dataset = JsonStat(json).Dataset(0)

      const filterOnMunicipalities = filterOptions && filterOptions._selected && filterOptions._selected === 'municipalityFilter'
      const graphType = highchart.data.graphType;
      const dimensionFilter = dataset.id.map( () => 0 )

      let xAxisTitle = highchart.data.xAxisTitle
      if (filterOnMunicipalities) {
        const municipality = getMunicipality(req)
        xAxisTitle = municipality.name
        const filterTarget = filterOptions.municipalityFilter.municipalityDimension
        const filterTargetIndex = dataset.id.indexOf(filterTarget)
        dimensionFilter[filterTargetIndex] = parseDataWithMunicipality(dataset, filterTarget, municipality, graphType[graphType._selected].xAxisLabel)
      }

      config = createConfig(highchart.data, highchart.displayName);

      if (graphType._selected === 'barNegative') {
        const barNegativData = barNegativeFormat(dataset, dimensionFilter, graphType.barNegative.xAxisLabel, graphType.barNegative.yAxisLabel)
        config.series = barNegativData.series
        config.xAxis = [{
          title: {
            style,
            text: xAxisTitle
          },
          categories: barNegativData.categories,
          reversed: false,
          labels: {
            step: 1,
            style
          },
          lineColor,
          accessibility: { description: graphType.barNegative.xAxisLabel }
        }];
      } else {
        const graphData = defaultFormat(dataset, dimensionFilter, graphType[graphType._selected].xAxisLabel)
        config.series = graphData.series
        config.xAxis = {
          categories: highchart.data.switchRowsAndColumns ? graphData.categories : [highchart.displayName],
          allowDecimals: !!highchart.data.xAllowDecimal,
          gridLineWidth: highchart.data.graphType._selected === 'line' ? 0 : 1,
          lineColor,
          tickInterval: highchart.data.tickInterval ? highchart.data.tickInterval.replace(/,/g, '.') : null,
          labels: {
            enabled: highchart.data.graphType._selected === 'line' || highchart.data.graphType._selected === 'area' || highchart.data.switchRowsAndColumns,
            style
          },
          max: highchart.data.xAxisMax ? highchart.data.xAxisMax.replace(/,/g, '.') : null,
          min: highchart.data.xAxisMin ? highchart.data.xAxisMin.replace(/,/g, '.') : null,
          // Confusing detail: when type=bar, X axis becomes Y and vice versa.
          // In other words, include 'bar' in this if-test, instead of putting it in the yAxis config
          tickmarkPlacement: (highchart.data.graphType._selected == 'column' || highchart.data.graphType._selected == 'bar') ? 'between' : 'on',
          title: {
            style,
            text: xAxisTitle
          },
          type: highchart.data.xAxisType || 'categories',
          tickWidth: 1,
          tickColor: '#21383a'
        }
      }

      config.xAxis.title = {
        text: xAxisTitle
      }

      if (!config.series) {
        config.data= {
          switchRowsAndColumns: highchart.data.switchRowsAndColumns,
          decimalPoint: ',',
          table: 'highcharts-datatable-' + highchart._id
        }
      }

      if (graphType._selected === 'pie' || highchart.data.switchRowsAndColumns) {
        config.series = [{name: 'Antall', data: config.series.map((serie) => ({y: serie.y, name: serie.name}))}]
      }
    }
    return initHighchart(highchart, config)
  })

  return {
    body: thymeleaf.render(view, { highcharts }),
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
    type: highchart.data.graphType._selected,
    contentKey: highchart._id,
    footnoteText: highchart.data.footnoteText,
    creditsEnabled: (highchart.data.creditsHref || highchart.data.creditsText) ? true : false,
    creditsHref: highchart.data.creditsHref,
    creditsText: highchart.data.creditsText,
    tableData: resultWithoutNbsp
  }
}
