import JsonStat from 'jsonstat-toolkit'
const {
  DataSource: DataSourceType
} = __non_webpack_require__( '/lib/repo/dataset')
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
  createHighchartObject
} = __non_webpack_require__('/lib/highcharts/highchartsUtils')
const {
  getDataset,
  extractKey
} = __non_webpack_require__('/lib/ssb/dataset/dataset')
const {
  renderError
} = __non_webpack_require__('/lib/error/error')
const {
  get: getDataquery
} = __non_webpack_require__( '/lib/ssb/dataquery')
const {
  fromDatasetRepoCache
} = __non_webpack_require__('/lib/ssb/cache')


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

exports.preview = (req, id) => {
  return renderPart(req, [id])
}

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
      config = createHighchartObject(req, highchart, cachedQuery.data, cachedQuery.format)
    } else if (highchart && highchart.data.dataSource) { // NEW
      const datasetFromRepo = datasetOrNull(highchart)
      let parsedData = datasetFromRepo && datasetFromRepo.data
      if (highchart.data.dataSource._selected === DataSourceType.STATBANK_API) {
        // eslint-disable-next-line new-cap
        parsedData = JsonStat(parsedData).Dataset(0)
      }
      config = parsedData && createHighchartObject(req, highchart, parsedData, highchart.data.dataSource) || undefined
    } else if (highchart && highchart.data.htmlTable) {
      config = {
        ...createHighchartObject(req, highchart, highchart.data, {
          _selected: 'htmlTable'
        })
      }
    }

    return createHighchartsReactProps(highchart, config)
  })

  return {
    body: render(view, {
      highcharts
    }),
    contentType: 'text/html'
  }
}

function datasetOrNull(highcharts) {
  return highcharts.data.dataSource && highcharts.data.dataSource._selected ?
    fromDatasetRepoCache(`/${highcharts.data.dataSource._selected}/${extractKey(highcharts)}`,
      () => getDataset(highcharts)) :
    null
}


function createHighchartsReactProps(highchart, config) {
  return {
    config: config,
    type: highchart.data.graphType,
    contentKey: highchart._id,
    footnoteText: highchart.data.footnoteText,
    creditsEnabled: (highchart.data.creditsHref || highchart.data.creditsText) ? true : false,
    creditsHref: highchart.data.creditsHref,
    creditsText: highchart.data.creditsText,
    hideTitle: highchart.data.hideTitle
  }
}
