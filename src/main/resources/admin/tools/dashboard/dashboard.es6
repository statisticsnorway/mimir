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

const content = __non_webpack_require__( '/lib/xp/content')
const React4xp = __non_webpack_require__('/lib/enonic/react4xp')

const view = resolve('./dashboard.html')

exports.get = function(req) {
  return renderPart()
  /*try {
    return renderPart()
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }*/
}

function renderPart() {
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
        hasData
      })
    })
  }

  const jsLibsUrl = assetUrl({
    path: 'js/bundle.js'
  })

  const dashboardService = serviceUrl({
    service: 'dashboard'
  })

  const stylesUrl = assetUrl({
    path: 'styles/bundle.css'
  })

  const logoUrl = assetUrl({path: 'SSB_logo_black.svg'});

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
    body
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
