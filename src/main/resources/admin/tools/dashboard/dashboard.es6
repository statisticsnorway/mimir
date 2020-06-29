const {
  getNode
} = __non_webpack_require__( '/lib/repo/common')

const {
  assetUrl,
  serviceUrl
} = __non_webpack_require__( '/lib/xp/portal')

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
const i18n = __non_webpack_require__('/lib/xp/i18n')
const {
  EVENT_LOG_BRANCH,
  EVENT_LOG_REPO,
  getQueryChildNodesStatus
} = __non_webpack_require__( '/lib/repo/eventLog')
const { Events } = __non_webpack_require__('/lib/repo/query')
const { STATREG_REPO_CONTACTS_KEY } = __non_webpack_require__('/lib/repo/statreg/contacts')
const { STATREG_REPO_STATISTICS_KEY } = __non_webpack_require__('/lib/repo/statreg/statistics')
const { STATREG_REPO_PUBLICATIONS_KEY } = __non_webpack_require__('/lib/repo/statreg/publications')
const { getToolUrl } = __non_webpack_require__('/lib/xp/admin');

const view = resolve('./dashboard.html')
const DEFAULT_CONTENTSTUDIO_URL = getToolUrl('com.enonic.app.contentstudio', 'main')

exports.get = function(req) {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

/**
 * @param {object} req
 * @return {{pageContributions: *, body: *}}
 */
function renderPart(req) {
  const datasetMap = getDataset()
  const dataQueries = getDataQueries(datasetMap)
  const statRegFetchStatuses = getStatRegFetchStatuses()

  const assets = getAssets()

  const dashboardDataset = new React4xp('Dashboard/Dashboard')
    .setProps({
      header: 'Alle spørringer',
      dataQueries,
      dashboardService: assets.dashboardService,
      clearCacheServiceUrl: assets.clearCacheServiceUrl,
      featureToggling: {
        updateList: req.params.updateList ? true : false
      },
      contentStudioBaseUrl: `${DEFAULT_CONTENTSTUDIO_URL}#/default/edit/`,
      statRegFetchStatuses
    })
    .setId('dataset')

  const pageContributions = parseContributions(dashboardDataset.renderPageContributions({
    clientRender: true
  }))

  log.info(`Sending statuses ${JSON.stringify(statRegFetchStatuses)}`)

  const model = {
    ...assets,
    dataQueries,
    pageContributions,
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

/**
 *
 * @return {{dashboardService: *, stylesUrl: *, jsLibsUrl: *, logoUrl: *}}
 */
function getAssets() {
  return {
    jsLibsUrl: assetUrl({
      path: 'js/bundle.js'
    }),
    dashboardService: serviceUrl({
      service: 'dashboard'
    }),
    stylesUrl: assetUrl({
      path: 'styles/bundle.css'
    }),
    logoUrl: assetUrl({
      path: 'SSB_logo_black.svg'
    }),
    clearCacheServiceUrl: serviceUrl({
      service: 'clearCache'
    })
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
  const dataQueryResult = content.query({
    count: 999,
    contentTypes: [`${app.name}:dataquery`],
    sort: 'displayName'
  })

  if (!dataQueryResult || !dataQueryResult.hits.length > 0) {
    return []
  }

  return dataQueryResult.hits.map((dataquery) => {
    const dataset = datasetMap[dataquery._id]
    const hasData = !!dataset
    const queryLogNode = getNode(EVENT_LOG_REPO, EVENT_LOG_BRANCH, `/queries/${dataquery._id}`)
    const eventLogNodes = getQueryChildNodesStatus(`/queries/${dataquery._id}`)
    return {
      id: dataquery._id,
      displayName: dataquery.displayName,
      path: dataquery._path,
      parentType: getParentType(dataquery._path),
      format: dataquery.data.datasetFormat ? dataquery.data.datasetFormat._selected : undefined,
      dataset: {
        modified: hasData ? dateToFormat(dataset.modifiedTime) : undefined,
        modifiedReadable: hasData ? dateToReadable(dataset.modifiedTime) : undefined
      },
      hasData,
      isPublished: isPublished(dataquery),
      logData: queryLogNode ? {
        ...queryLogNode.data,
        showWarningIcon: showWarningIcon(queryLogNode.data.modifiedResult),
        message: i18n.localize({
          key: queryLogNode.data.modifiedResult
        }),
        modified: queryLogNode.data.modified,
        modifiedReadable: dateToReadable(queryLogNode.data.modifiedTs),
        eventLogNodes
      } : undefined,
      loading: false,
      deleting: false
    }
  })
}

function showWarningIcon(result) {
  return [
    Events.FAILED_TO_GET_DATA,
    Events.FAILED_TO_REQUEST_DATASET,
    Events.FAILED_TO_CREATE_DATASET,
    Events.FAILED_TO_REFRESH_DATASET
  ].indexOf(result) >= 0
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

const getStatRegFetchStatuses = () => {
  return [
    STATREG_REPO_CONTACTS_KEY,
    STATREG_REPO_STATISTICS_KEY,
    STATREG_REPO_PUBLICATIONS_KEY
  ].reduce((acc, key) => {
    const eventLogKey = `/statreg/${key}`
    const eventLogNode = getNode(EVENT_LOG_REPO, EVENT_LOG_BRANCH, eventLogKey)
    return {
      ...acc,
      [key]: eventLogNode.data && eventLogNode.data.latestEventInfo ? eventLogNode.data.latestEventInfo: undefined
    }
  }, {})
}
