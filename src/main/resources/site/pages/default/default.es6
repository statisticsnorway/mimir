const {
  getContent,
  processHtml,
  assetUrl
} = __non_webpack_require__( '/lib/xp/portal')
const thymeleaf = __non_webpack_require__( '/lib/thymeleaf')
const {
  getLanguage
} = __non_webpack_require__( '/lib/language')
const {
  alertsForContext,
  pageMode,
  getBreadcrumbs
} = __non_webpack_require__( '/lib/ssb/utils')
const {
  getMunicipality
} = __non_webpack_require__( '/lib/klass/municipalities')
const React4xp = __non_webpack_require__('/lib/enonic/react4xp')
const util = __non_webpack_require__( '/lib/util')
const {
  getHeaderContent
} = __non_webpack_require__( '/lib/ssb/header')

const version = '%%VERSION%%'
const partsWithPreview = [ // Parts that has preview
  `${app.name}:map`,
  `${app.name}:button`,
  `${app.name}:menuBox`,
  `${app.name}:accordion`,
  `${app.name}:highchart`,
  `${app.name}:dashboard`,
  `${app.name}:key-figure`,
  `${app.name}:keyFigure`,
  `${app.name}:menuDropdown`,
  `${app.name}:statistikkbanken`,
  `${app.name}:dataquery`,
  `${app.name}:factBox`
]

const view = resolve('default.html')

exports.get = function(req) {
  const ts = new Date().getTime()
  const page = getContent()
  const mode = pageMode(req, page)

  const isFragment = page.type === 'portal:fragment'
  let regions = {}
  let configRegions = []
  if (isFragment) {
    regions = page.fragment && page.fragment.regions ? page.fragment.regions : {}
  } else {
    const pageData = page.page
    if (pageData) {
      regions = pageData.regions ? pageData.regions : {}
      configRegions = pageData.config && pageData.config.regions ? util.data.forceArray(pageData.config.regions) : []
    }
  }
  configRegions.forEach((configRegion) => {
    configRegion.components = regions[configRegion.region] ? util.data.forceArray(regions[configRegion.region].components) : []
  })

  const mainRegionComponents = regions && regions.main && regions.main.components.length > 0 ? regions.main.components : undefined
  const ingress = processHtml({
    value: page.data.ingress ? page.data.ingress.replace(/&nbsp;/g, ' ') : undefined
  })
  const showIngress = ingress && page.type === 'mimir:page'


  // Create preview if available
  let preview
  if (partsWithPreview.indexOf(page.type) >= 0) {
    const name = page.type.replace(/^.*:/, '')
    const controller = __non_webpack_require__(`../../parts/${name}/${name}`)
    if (controller.preview) {
      preview = controller.preview(req, page._id)
    }
  }

  const language = getLanguage(page)
  let municipality
  if (req.params.selfRequest) {
    municipality = getMunicipality(req)
  }

  let config
  if (!isFragment && page.page.config) {
    config = page.page.config
  } else if (isFragment && page.fragment.config) {
    config = page.fragment.config
  }

  const bodyClasses = []
  if (config && config.bkg_color === 'grey') {
    bodyClasses.push('bkg-grey')
  }

  const stylesUrl = assetUrl({
    path: 'styles/bundle.css',
    params: {
      ts
    }
  })

  const jsLibsUrl = assetUrl({
    path: 'js/bundle.js',
    params: {
      ts
    }
  })

  const bannerUrl = assetUrl({
    path: 'top-banner.png'
  })

  const pageTitle = req.params.selfRequest ? req.params.pageTitle : page.displayName
  const model = {
    version,
    config,
    page,
    mainRegionComponents,
    configRegions,
    ingress,
    mode,
    showIngress,
    preview,
    pageTitle: `${pageTitle} - Statistisk sentralbyrå`,
    bodyClasses: bodyClasses.join(' '),
    stylesUrl,
    jsLibsUrl,
    bannerUrl,
    language,
    GA_TRACKING_ID: app.config && app.config.GA_TRACKING_ID ? app.config.GA_TRACKING_ID : null
  }

  let body = thymeleaf.render(view, model)
  let pageContributions
  if (preview && preview.pageContributions) {
    pageContributions = preview.pageContributions
  }

  const headerContent = getHeaderContent(language)
  const headerComponent = new React4xp('Header')
    .setProps({
      ...headerContent
    })
    .setId('header')
  body = headerComponent.renderBody({
    body
  })
  pageContributions = headerComponent.renderPageContributions({
    pageContributions
  })

  const breadcrumbs = getBreadcrumbs(page, municipality)
  const breadcrumbComponent = new React4xp('Breadcrumb')
    .setProps({
      items: breadcrumbs
    })
    .setId('breadcrumbs')
  body = breadcrumbComponent.renderBody({
    body
  })

  const alerts = alertsForContext(municipality)
  if (alerts.length > 0) {
    const alertComponent = new React4xp('Alerts')
      .setProps({
        alerts
      })
      .setId('alerts')
    body = alertComponent.renderBody({
      body,
      clientRender: true
    })
    pageContributions = alertComponent.renderPageContributions({
      pageContributions,
      clientRender: true
    })
  }

  return {
    body,
    pageContributions
  }
}
