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
const React4xp = __non_webpack_require__('/lib/enonic/react4xp')

const view = resolve('./dashboard.html')

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
  const assets = getAssets()
  // const user = auth.getUser()

  const dashboardDataset = new React4xp('Dashboard/Dashboard')
    .setProps({
    })
    .setId('dashboard')

  const pageContributions = parseContributions(dashboardDataset.renderPageContributions({
    clientRender: true
  }))

  const model = {
    ...assets,
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
    }),
    wsServiceUrl: serviceUrl({
      service: 'websocket'
    }),
    convertServiceUrl: serviceUrl({
      service: 'convert'
    }),
    fetchLogUrl: serviceUrl({
      service: 'eventLog'
    })
  }
}

function parseContributions(contributions) {
  contributions.bodyEnd = contributions.bodyEnd.map((script) => script.replace(' defer>', ' defer="">'))
  return contributions
}
