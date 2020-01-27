const content = __non_webpack_require__( '/lib/xp/content')
const {
  getContent,
  processHtml,
  assetUrl,
  pageUrl
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

  const language = languageLib.getLanguage(page)
  let alternateLanguageVersionUrl
  if (language.exists) {
    alternateLanguageVersionUrl = pageUrl({
      path: language.path
    })
  }

  const breadcrumbs = getBreadcrumbs(page, language)

  let municipality
  if (mode === 'municipality') {
    municipality = getMunicipality(req)
    if (municipality) {
      breadcrumbs.push({
        text: municipality.displayName
      })
    }
  }

  const alerts = alertsForContext(municipality)

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

  const breadcrumbComponent = new React4xp('Breadcrumb')
    .setProps({
      items: breadcrumbs
    })
    .setId('breadcrumbs')
    .uniqueId()
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
    breadcrumbId: breadcrumbComponent.react4xpId,
    alerts,
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
  body = breadcrumbComponent.renderSSRIntoContainer(body)
  const pageContributions = breadcrumbComponent.renderPageContributions()

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

function getBreadcrumbs(page, language, breadcrumbs = []) {
  if (page.type === 'portal:site') {
    breadcrumbs.unshift({
      text: language.phrases.home,
      link: 'http://ssb.no'
    })
  } else {
    breadcrumbs.unshift({
      text: page.displayName,
      link: pageUrl({
        path: page._path
      })
    })
    const parent = content.get({
      key: page._path.substring(0, page._path.lastIndexOf('/'))
    })

    if (parent) {
      return getBreadcrumbs(parent, language, breadcrumbs)
    }
  }
  return breadcrumbs
}
