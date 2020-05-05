import { I18nLibrary } from 'enonic-types/lib/i18n'

const {
  assetUrl,
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
const {
  isPublished, dateToFormat, dateToReadable
} = __non_webpack_require__('/lib/ssb/utils')
const content = __non_webpack_require__( '/lib/xp/content')
const React4xp = __non_webpack_require__('/lib/enonic/react4xp')
const {
  getQueryLogWithQueryId
} = __non_webpack_require__('/lib/repo/query')
const i18n = __non_webpack_require__('/lib/xp/i18n')
const view = resolve('./dashboard.html')

exports.get = function(req) {
  return renderPart()
  try {
    return renderPart()
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}


function renderPart() {
  const datasetMap = getDataset()
  const dataQueries = getDataQueries(datasetMap)

  const jsLibsUrl = assetUrl({
    path: 'js/bundle.js'
  })

  const dashboardService = serviceUrl({
    service: 'dashboard'
  })

  const stylesUrl = assetUrl({
    path: 'styles/bundle.css'
  })

  const logoUrl = assetUrl({
    path: 'SSB_logo_black.svg'
  })

  const dashboardDataset = new React4xp('Dashboard/Dashboard')
    .setProps({
      header: 'Alle spørringer',
      dataQueries,
      dashboardService
    })
    .setId('dataset')

  const pageContributions = parseContributions(dashboardDataset.renderPageContributions({
    clientRender: true
  }))

  const model = {
    dataQueries,
    dashboardService,
    stylesUrl,
    jsLibsUrl,
    logoUrl,
    pageContributions
  }

  let body = render(view, model)

  body = dashboardDataset.renderBody({
    body,
    clientRender: true
  })

  return {
    body,
    pageContributions
  }
}

function parseContributions(contributions) {
  contributions.bodyEnd = contributions.bodyEnd.map((script) => script.replace(' defer>', ' defer="">'))
  return contributions
}

function getDataset() {
  const datasetMap = {}
  const result = content.query({
    count: 9999,
    contentTypes: [`${app.name}:dataset`]
  })

  if (result && result.hits.length > 0) {
    result.hits.forEach((set) => {
      datasetMap[set.data.dataquery] = set
    })
  }
  return datasetMap
}

function getDataQueries(datasetMap) {
  let dataQueries = []
  const dataQueryResult = content.query({
    count: 999,
    contentTypes: [`${app.name}:dataquery`],
    sort: 'displayName'
  })
  if (dataQueryResult && dataQueryResult.hits.length > 0) {
    dataQueries = dataQueryResult.hits.map((dataquery) => {
      let updated
      let updatedHumanReadable
      const dataset = datasetMap[dataquery._id]
      const hasData = !!dataset
      if (hasData) {
        updated = getUpdated(dataset)
        updatedHumanReadable = getUpdatedReadable(dataset)
      }
      return {
        id: dataquery._id,
        displayName: dataquery.displayName,
        path: dataquery._path,
        parentType: getParentType(dataquery._path),
        format: dataquery.data.datasetFormat ? dataquery.data.datasetFormat._selected : undefined,
        updated,
        updatedHumanReadable,
        hasData,
        isPublished: isPublished(dataquery),
        logData: getLogData(dataquery._id)
      }
    })
  }
  return dataQueries
}

function getLogData(dataQueryId) {
  const logData = getQueryLogWithQueryId(dataQueryId)
  return logData ? parseLogData(logData.data) : undefined
}

function parseLogData(data) {
  return {
    ...data,
    lastUpdated: data && data.lastUpdated ? dateToFormat(data.lastUpdated) : undefined,
    lastUpdatedHumanReadable: data && data.lastUpdated ? dateToReadable(data.lastUpdated) : undefined,
    lastUpdateResult: data.lastUpdateResult ? i18n.localize({
      key: data.lastUpdateResult
    }) : undefined
  }
}

function getParentType(path) {
  const parentPath = getParentPath(path)
  const parentContent = content.get({
    key: parentPath
  })

  if (parentContent) {
    if (parentContent.page.config || parentContent.type === 'portal:site') {
      return parentContent.page.config.pageType ? parentContent.page.config.pageType : 'default'
    } else {
      return getParentType(parentPath)
    }
  } else {
    log.error(`Cound not find content from path ${path}`)
    return undefined
  }
}

function getParentPath(path) {
  const pathElements = path.split('/')
  pathElements.pop()
  return pathElements.join('/')
}
