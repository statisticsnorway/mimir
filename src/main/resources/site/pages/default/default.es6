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
const {
  getFooterContent
} = __non_webpack_require__( '/lib/ssb/footer')
const {
  fromMenuCache
} = __non_webpack_require__('/lib/ssb/cache')

const partsWithPreview = [ // Parts that has preview
  `${app.name}:map`,
  `${app.name}:button`,
  `${app.name}:menuBox`,
  `${app.name}:accordion`,
  `${app.name}:highchart`,
  `${app.name}:dashboard`,
  `${app.name}:keyFigure`,
  `${app.name}:menuDropdown`,
  `${app.name}:statistikkbanken`,
  `${app.name}:dataquery`,
  `${app.name}:factBox`
]

const view = resolve('default.html')

exports.get = function(req) {
  const page = getContent()

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

  let metainfoSearchTitle = page.displayName
  let metainfoSearchContentType = page._name
  let metainfoSearchGroup = page._id
  let metainfoSearchKeywords = ''

  if (page._name === 'kommunefakta') {
    metainfoSearchKeywords = 'kommune, kommuneprofil'
  }

  if (municipality) {
    metainfoSearchTitle = 'Kommunefakta ' + municipality.displayName
    metainfoSearchContentType = 'kommunefakta'
    metainfoSearchGroup = metainfoSearchGroup + '_' + municipality.code
    metainfoSearchKeywords = municipality.displayName + ' kommune'
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
    path: 'styles/bundle.css'
  })

  const jsLibsUrl = assetUrl({
    path: 'js/bundle.js'
  })

  let pageContributions
  if (preview && preview.pageContributions) {
    pageContributions = preview.pageContributions
  }

  const header = fromMenuCache(req, 'header', () => {
    const headerContent = getHeaderContent(language)
    if (headerContent) {
      const headerComponent = new React4xp('Header')
        .setProps({
          ...headerContent
        })
        .setId('header')
      return {
        body: headerComponent.renderBody({
          body: '<div id="header"></div>'
        }),
        component: headerComponent
      }
    }
    return undefined
  })
  if (header && header.component) {
    pageContributions = header.component.renderPageContributions({
      pageContributions
    })
  }

  const footer = fromMenuCache(req, 'footer', () => {
    const footerContent = getFooterContent(language)
    if (footerContent) {
      const footerComponent = new React4xp('Footer')
        .setProps({
          ...footerContent
        })
        .setId('footer')
      return {
        body: footerComponent.renderBody({
          body: '<footer id="footer"></footer>'
        }),
        component: footerComponent
      }
    }
    return undefined
  })

  if (footer && footer.component) {
    pageContributions = footer.component.renderPageContributions({
      pageContributions
    })
  }

  const model = {
    pageTitle: 'SSB', // not really used on normal pages because of SEO app (404 still uses this)
    page,
    mainRegionComponents,
    configRegions,
    ingress,
    showIngress,
    preview,
    bodyClasses: bodyClasses.join(' '),
    stylesUrl,
    jsLibsUrl,
    language,
    GA_TRACKING_ID: app.config && app.config.GA_TRACKING_ID ? app.config.GA_TRACKING_ID : null,
    headerBody: header ? header.body : undefined,
    footerBody: footer ? footer.body : undefined,
    metainfoSearchTitle,
    metainfoSearchGroup,
    metainfoSearchContentType,
    metainfoSearchKeywords
  }

  let body = thymeleaf.render(view, model)

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
