const content = __non_webpack_require__( '/lib/xp/content')
const {
  getContent, processHtml, assetUrl, pageUrl
} = __non_webpack_require__( '/lib/xp/portal')
const thymeleaf = __non_webpack_require__( '/lib/thymeleaf')
const glossaryLib = __non_webpack_require__( '/lib/glossary')
const languageLib = __non_webpack_require__( '/lib/language')
const {
  alertsForContext, pageMode
} = __non_webpack_require__( '/lib/ssb/utils')
const {
  getMunicipality
} = __non_webpack_require__( '/lib/klass/municipalities')
const React4xp = __non_webpack_require__('/lib/enonic/react4xp')

const version = '%%VERSION%%'
const partsWithPreview = [ // Parts that has preview
  `${app.name}:map`,
  `${app.name}:button`,
  `${app.name}:menu-box`,
  `${app.name}:glossary`,
  `${app.name}:accordion`,
  `${app.name}:highchart`,
  `${app.name}:dashboard`,
  `${app.name}:key-figure`,
  `${app.name}:menu-dropdown`,
  `${app.name}:statistikkbanken`,
  `${app.name}:dataquery`
]

function getBreadcrumbs(c, a) {
  const key = c._path.replace(/\/[^\/]+$/, '')
  c = key && content.get({
    key
  })
  c && c.type.match(/:page$/) && a.unshift(c) && getBreadcrumbs(c, a)
}

const view = resolve('default.html')

exports.get = function(req) {
  const ts = new Date().getTime()
  const page = getContent()
  const isFragment = page.type === 'portal:fragment'
  let regions = null
  if (isFragment) {
    regions = page.fragment && page.fragment.regions ? page.fragment.regions : null
  } else {
    regions = page.page && page.page.regions ? page.page.regions : null
  }
  const mainRegion = isFragment ? regions && regions.main : regions && regions.main

  const mode = pageMode(req, page)
  const mainRegionComponents = mapComponents(mainRegion, mode)

  const glossary = glossaryLib.process(page.data.ingress, regions)
  const ingress = processHtml({
    value: page.data.ingress
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

  const breadcrumbs = [page]
  getBreadcrumbs(page, breadcrumbs)

  const municipality = getMunicipality(req)
  if (!page._path.endsWith(req.path.split('/').pop()) && req.mode != 'edit' ) {
    breadcrumbs.push({
      displayName: municipality.displayName
    })
  }

  let config
  if (!isFragment && page.page.config) {
    config = page.page.config
  } else if (isFragment && page.fragment.config) {
    config = page.fragment.config
  }

  const bodyClasses = []
  if (mode !== 'map' && config && config.bkg_color === 'grey') {
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

  const logoUrl = assetUrl({
    path: 'SSB_logo.png'
  })

  const language = languageLib.getLanguage(page)
  let alternateLanguageVersionUrl
  if (language.exists) {
    alternateLanguageVersionUrl = pageUrl({
      path: language.path
    })
  }


  const model = {
    version,
    config,
    page,
    mainRegion,
    mainRegionComponents,
    glossary,
    ingress,
    mode,
    showIngress,
    preview,
    breadcrumbs,
    bodyClasses: bodyClasses.join(' '),
    stylesUrl,
    jsLibsUrl,
    bannerUrl,
    logoUrl,
    language,
    alternateLanguageVersionUrl,
    GA_TRACKING_ID: app.config && app.config.GA_TRACKING_ID ? app.config.GA_TRACKING_ID : null
  }

  let body = thymeleaf.render(view, model)
  let pageContributions
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

function mapComponents(mainRegion, mode) {
  if (mainRegion && mainRegion.components) {
    return mainRegion.components.map((component) => {
      const descriptor = component.descriptor
      const classes = []
      if (descriptor !== 'mimir:banner' && descriptor !== 'mimir:menu-dropdown' && descriptor !== 'mimir:map' ) {
        classes.push('container')
      }
      if (descriptor === 'mimir:menu-dropdown' && mode === 'municipality') {
        classes.push('sticky-top')
      }
      if (descriptor === 'mimir:preface') {
        classes.push('preface-container')
      }
      return {
        path: component.path,
        removeWrapDiv: descriptor === 'mimir:banner',
        classes: classes.join(' ')
      }
    })
  }
  return []
}
