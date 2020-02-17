const {
  getComponent,
  serviceUrl
} = __non_webpack_require__( '/lib/xp/portal')
const {
  getUpdated,
  getUpdatedReadable
} = __non_webpack_require__('/lib/ssb/dataset')
const {
  render
} = __non_webpack_require__( '/lib/thymeleaf')
const {
  renderError
} = __non_webpack_require__('/lib/error/error')

const content = __non_webpack_require__( '/lib/xp/content')
const util = __non_webpack_require__( '/lib/util')
const view = resolve('./dashboard.html')

exports.get = function(req) {
  try {
    const part = getComponent()
    const dashboardIds = part.config.dashboard ? util.data.forceArray(part.config.dashboard) : []
    return renderPart(req, dashboardIds)
  } catch (e) {
    return renderError('Error in part', e)
  }
}

exports.preview = (req, id) => renderPart(req, [id])

function renderPart(req, dashboardIds) {
  const dashboards = []
  const datasetMap = {}

  const result = content.query({
    count: 999,
    contentTypes: [`${app.name}:dataset`]
  })

  if (result && result.hits.length > 0) {
    result.hits.forEach((set) => {
      datasetMap[set.data.dataquery] = set
    })
  }

  const dataQueries = []
  const dataQueryResult = content.query({
    count: 999,
    contentTypes: [`${app.name}:dataquery`],
    sort: 'displayName'
  })
  if (dataQueryResult && dataQueryResult.hits.length > 0) {
    dataQueryResult.hits.forEach((dataquery) => {
      let updated
      let updatedHumanReadable
      const dataset = datasetMap[dataquery._id]
      const hasData = !!dataset
      if (hasData) {
        updated = getUpdated(dataset)
        updatedHumanReadable = getUpdatedReadable(dataset)
      }
      dataQueries.push({
        id: dataquery._id,
        displayName: dataquery.displayName,
        updated,
        updatedHumanReadable,
        class: hasData ? 'dataset-ok' : 'dataset-missing'
      })
    })
  }

  dashboardIds.forEach((key) => {
    const item = content.get({
      key
    })
    if (item) {
      dashboards.push({
        displayName: item.displayName
      })
    }
  })

  const dashboardService = serviceUrl({
    service: 'dashboard'
  })
  const model = {
    dashboards,
    dataQueries,
    dashboardService
  }
  const body = render(view, model)

  return {
    body,
    contentType: 'text/html'
  }
}
