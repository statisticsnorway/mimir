import JsonStat from 'jsonstat-toolkit'
import { DataSource as DataSourceType } from '../../../lib/repo/dataset'
const util = __non_webpack_require__( '/lib/util')
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
} = __non_webpack_require__('/lib/highcharts/config')
const {
  prepareHighchartsData,
  prepareHighchartsGraphConfig
} = __non_webpack_require__('/lib/highcharts/highchartsUtils')
const {
  getDataset
} = __non_webpack_require__('/lib/ssb/dataset/dataset')
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
    if (highchart && highchart.data.dataquery) { // OLD
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
      config = createHighchartData(req, highchart, cachedQuery.data, cachedQuery.format)
    } else if (highchart && highchart.data.dataSource) { // NEW
      const datasetFromRepo = getDataset(highchart)
      let parsedData = datasetFromRepo && datasetFromRepo.data
      if (highchart.data.dataSource._selected === DataSourceType.STATBANK_API) {
        // eslint-disable-next-line new-cap
        parsedData = JsonStat(parsedData).Dataset(0)
      }
      config = parsedData && createHighchartData(req, highchart, parsedData, highchart.data.dataSource) || undefined
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

function createHighchartData(req, highchartContent, data, datasetFormat) {

  const isJsonStat = datasetFormat._selected === 'jsonStat' || datasetFormat._selected === DataSourceType.STATBANK_API
  log.info('%s', JSON.stringify(datasetFormat, null, 2))
  log.info('is jsonstat %s', JSON.stringify(isJsonStat, null, 2))
  const highchartsData = prepareHighchartsData(req, highchartContent, data, datasetFormat)
  const highchartsGraphConfig = prepareHighchartsGraphConfig(highchartContent, highchartsData, isJsonStat, datasetFormat)

  if (!highchartsGraphConfig.series) {
    highchartsGraphConfig.data = {
      switchRowsAndColumns: highchartContent.data.switchRowsAndColumns,
      decimalPoint: ',',
      table: 'highcharts-datatable-' + highchartContent._id
    }
  }

  return highchartsGraphConfig
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
