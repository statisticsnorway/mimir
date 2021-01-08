import JsonStat from 'jsonstat-toolkit'
const {
  DataSource: DataSourceType,
  getDataset,
  UNPUBLISHED_DATASET_BRANCH
} = __non_webpack_require__( '/lib/repo/dataset')
const util = __non_webpack_require__( '/lib/util')
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
  renderError
} = __non_webpack_require__('/lib/error/error')
const {
  datasetOrUndefined
} = __non_webpack_require__('/lib/ssb/cache')
const {
  hasWritePermissions
} = __non_webpack_require__('/lib/ssb/permissions')


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
  try {
    return renderPart(req, [id])
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
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
    if (highchart && highchart.data.dataSource) {
      const type = highchart.data.dataSource._selected
      const paramShowDraft = req.params.showDraft
      const showPreviewDraft = hasWritePermissions(req, highchart._id) && type === 'tbprocessor' && paramShowDraft === 'true'
      const draftData = showPreviewDraft ? getDataset(type, UNPUBLISHED_DATASET_BRANCH, highchart.data.dataSource.tbprocessor.urlOrId) : null

      const datasetFromRepo = draftData ? draftData : datasetOrUndefined(highchart)

      let parsedData = datasetFromRepo && datasetFromRepo.data
      if (highchart.data.dataSource._selected === DataSourceType.STATBANK_API) {
        // eslint-disable-next-line new-cap
        parsedData = JsonStat(parsedData).Dataset(0)
      }
      config = parsedData && createHighchartObject(req, highchart, parsedData, highchart.data.dataSource) || undefined
      config.draft = !!draftData
      config.noDraftAvailable = showPreviewDraft && !draftData
    } else if (highchart && highchart.data.htmlTable) {
      config = {
        ...createHighchartObject(req, highchart, highchart.data, {
          _selected: 'htmlTable'
        })
      }
    }
    return createHighchartsReactProps(highchart, config)
  }).filter((key) => !!key)

  const inlineScript = highcharts.map((highchart) => `<script inline="javascript">
   window['highchart' + '${highchart.contentKey}'] = ${JSON.stringify(highchart.config)}
   </script>`)

  return {
    body: render(view, {
      highcharts
    }),
    pageContributions: {
      bodyEnd: inlineScript
    },
    contentType: 'text/html'
  }
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
