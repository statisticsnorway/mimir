const {
  createMeasurement
} = __non_webpack_require__('/lib/ssb/perf')
const {
  getNode
} = __non_webpack_require__('/lib/repo/common')
const {
  fromDatasetRepoCache
} = __non_webpack_require__('/lib/ssb/cache')
const {
  assetUrl,
  serviceUrl
} = __non_webpack_require__('/lib/xp/portal')

const {
  render
} = __non_webpack_require__('/lib/thymeleaf')
const {
  renderError
} = __non_webpack_require__('/lib/error/error')
const {
  isPublished, dateToFormat, dateToReadable
} = __non_webpack_require__('/lib/ssb/utils')
const content = __non_webpack_require__('/lib/xp/content')
const React4xp = __non_webpack_require__('/lib/enonic/react4xp')
const i18n = __non_webpack_require__('/lib/xp/i18n')
const {
  EVENT_LOG_BRANCH,
  EVENT_LOG_REPO
} = __non_webpack_require__('/lib/repo/eventLog')
const {
  Events
} = __non_webpack_require__('/lib/repo/query')
const {
  getToolUrl
} = __non_webpack_require__('/lib/xp/admin')
const {
  getContentWithDataSource,
  getDataset,
  extractKey
} = __non_webpack_require__('/lib/ssb/dataset/dataset')
const {
  getStatRegFetchStatuses
} = __non_webpack_require__('/lib/repo/statreg')

import { filter, includes } from 'ramda'

const view = resolve('./dashboard.html')
const DEFAULT_CONTENTSTUDIO_URL = getToolUrl('com.enonic.app.contentstudio', 'main')

const perf = createMeasurement('XP SSR perf')

const MEASUREMENT_MARKS = {
  XP_DATASET: 'XP Dataset Fetch (content)',
  XP_DATAQUERIES: 'XP Dataqueries Fetch (content)',
  XP_CONTENT_TOTAL: 'XP Content (Total)',
  REPO_STATREG_FETCH: 'StatReg Fetch (repo)',
  REPO_DATASOURCES: 'Fetch Datasources (from Repo)',
  XP_RENDER: 'XP Render Part'
}

exports.get = function(req) {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

// If there exists content with datasource and the old dataquery, prefer the one with datasource
// TODO: verify if this is correct.
//       if we cannot afford to pick just the intersection, return a join of both input arrays
const preferContentWithDataSource = (contentWithDataSource, dataQueries) => {
  const dsIds = contentWithDataSource.map((ds) => ds.id)
  const exclQueries = filter((dq) => !includes(dq.id, dsIds), dataQueries) || []
  return [...contentWithDataSource, ...exclQueries]
}

/**
 * @param {object} req
 * @return {{pageContributions: *, body: *}}
 */
function renderPart(req) {
  perf.clearMarks()
  perf.clearMeasures()
  perf.mark('start')
  const datasetMap = oldGetDataset()
  perf.mark(MEASUREMENT_MARKS.XP_DATASET)
  const dataQueries = oldGetDataQueries(datasetMap)
  perf.mark(MEASUREMENT_MARKS.XP_DATAQUERIES)
  const statRegFetchStatuses = getStatRegFetchStatuses()
  perf.mark(MEASUREMENT_MARKS.REPO_STATREG_FETCH)

  const contentWithDataSource = prepDataSources(req, getContentWithDataSource())
  perf.mark(MEASUREMENT_MARKS.REPO_DATASOURCES)

  const assets = getAssets()

  // log.info(`Content with DataSource: ${contentWithDataSource.length}`)
  // log.info(`Content DQ ${dataQueries.length}`)

  // const dsIds = contentWithDataSource.map((ds) => ds.id)
  // const int = filter((dq) => !!includes(dq.id, dsIds), dataQueries)
  // log.info(`Content intersect ${int && Array.isArray(int) && int.map((i) => i.id)}`)

  const dashboardDataset = new React4xp('Dashboard/Dashboard')
    .setProps({
      header: 'Alle spørringer',
      dataQueries: preferContentWithDataSource(contentWithDataSource, dataQueries),
      dashboardService: assets.dashboardService,
      clearCacheServiceUrl: assets.clearCacheServiceUrl,
      convertServiceUrl: assets.convertServiceUrl,
      featureToggling: {
        updateList: req.params.updateList ? true : false
      },
      contentStudioBaseUrl: `${DEFAULT_CONTENTSTUDIO_URL}#/default/edit/`,
      statRegFetchStatuses,
      ...assets
    })
    .setId('dataset')

  const pageContributions = parseContributions(dashboardDataset.renderPageContributions({
    clientRender: true
  }))

  const model = {
    ...assets,
    dataQueries,
    pageContributions
  }

  let body = render(view, model)

  body = dashboardDataset.renderBody({
    body,
    clientRender: true
  })

  perf.mark(MEASUREMENT_MARKS.XP_RENDER)

  perf.measure(MEASUREMENT_MARKS.XP_DATASET, 'start', MEASUREMENT_MARKS.XP_DATASET)
  perf.measure(MEASUREMENT_MARKS.XP_DATAQUERIES, MEASUREMENT_MARKS.XP_DATASET, MEASUREMENT_MARKS.XP_DATAQUERIES)
  perf.measure(MEASUREMENT_MARKS.XP_CONTENT_TOTAL, 'start', MEASUREMENT_MARKS.XP_DATAQUERIES)
  perf.measure(MEASUREMENT_MARKS.REPO_STATREG_FETCH, MEASUREMENT_MARKS.XP_DATAQUERIES, MEASUREMENT_MARKS.REPO_STATREG_FETCH)
  perf.measure(MEASUREMENT_MARKS.REPO_DATASOURCES, MEASUREMENT_MARKS.REPO_STATREG_FETCH, MEASUREMENT_MARKS.REPO_DATASOURCES)
  perf.measure(MEASUREMENT_MARKS.XP_RENDER, MEASUREMENT_MARKS.REPO_DATASOURCES, MEASUREMENT_MARKS.XP_RENDER)
  // log.info(JSON.stringify(perf.getMeasurements(), null, 2))

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
  log.info(`svc url :: dashboard ${serviceUrl({ service: 'dashboard '})}`)
  log.info(`svc url :: statregDashboard ${serviceUrl({ service: 'statregDashboard '})}`)
  return {
    jsLibsUrl: assetUrl({
      path: 'js/bundle.js'
    }),
    dashboardService: serviceUrl({
      service: 'dashboard'
    }),
    statregRefreshUrl: serviceUrl({
      service: 'statregDashboard'
    }),
    stylesUrl: assetUrl({
      path: 'styles/bundle.css'
    }),
    logoUrl: assetUrl({
      path: 'SSB_logo_black.svg'
    }),
    clearCacheServiceUrl: serviceUrl({
      service: 'clearCache'
    }),
    refreshStatregDataUrl: serviceUrl({
      service: 'statregDashboard'
    }),
    wsServiceUrl: serviceUrl({
      service: 'websocket'
    }),
    convertServiceUrl: serviceUrl({
      service: 'convert'
    })
  }
}

function parseContributions(contributions) {
  contributions.bodyEnd = contributions.bodyEnd.map((script) => script.replace(' defer>', ' defer="">'))
  return contributions
}

function oldGetDataset() {
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

function oldGetDataQueries(datasetMap) {
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

    const eventLogNodes = [] // getQueryChildNodesStatus(`/queries/${dataquery._id}`)

    return {
      id: dataquery._id,
      displayName: dataquery.displayName,
      path: dataquery._path,
      parentType: getParentType(dataquery._path),
      format: dataquery.data.datasetFormat ? dataquery.data.datasetFormat._selected : undefined,
      dataset: {
        modified: hasData ? dataset.modifiedTime : undefined,
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

function prepDataSources(req, dataSources) {
  return dataSources.map((dataSource) => {
    const dataset = fromDatasetRepoCache(`/${dataSource.data.dataSource._selected}/${extractKey(dataSource)}`, () => getDataset(dataSource))
    const hasData = !!dataset
    const queryLogNode = getNode(EVENT_LOG_REPO, EVENT_LOG_BRANCH, `/queries/${dataSource._id}`)
    const eventLogNodes = [] // getQueryChildNodesStatus(`/queries/${dataSource._id}`)
    return {
      id: dataSource._id,
      displayName: dataSource.displayName,
      path: dataSource._path,
      parentType: getParentType(dataSource._path),
      format: dataSource.data.dataSource._selected,
      dataset: {
        modified: hasData ? dateToFormat(dataset._ts) : undefined,
        modifiedReadable: hasData ? dateToReadable(dataset._ts) : undefined
      },
      hasData,
      isPublished: isPublished(dataSource),
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

