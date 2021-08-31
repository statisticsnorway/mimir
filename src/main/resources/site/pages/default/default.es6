const {
  getContent,
  processHtml,
  assetUrl,
  getSiteConfig
} = __non_webpack_require__('/lib/xp/portal')
const thymeleaf = __non_webpack_require__('/lib/thymeleaf')
const {
  getLanguage
} = __non_webpack_require__('/lib/ssb/utils/language')
const {
  alertsForContext
} = __non_webpack_require__('/lib/ssb/utils/alertUtils')
const {
  getBreadcrumbs
} = __non_webpack_require__('/lib/ssb/utils/breadcrumbsUtils')
const {
  getReleaseDatesByVariants
} = __non_webpack_require__('/lib/ssb/statreg/statistics')
const {
  getMunicipality
} = __non_webpack_require__('/lib/ssb/dataset/klass/municipalities')
const React4xp = __non_webpack_require__('/lib/enonic/react4xp')
const util = __non_webpack_require__('/lib/util')
const {
  getHeaderContent
} = __non_webpack_require__('/lib/ssb/parts/header')
const {
  getFooterContent
} = __non_webpack_require__('/lib/ssb/parts/footer')
const {
  fromMenuCache
} = __non_webpack_require__('/lib/ssb/cache/cache')
const {
  getStatisticByIdFromRepo
} = __non_webpack_require__('/lib/ssb/statreg/statistics')
const {
  localize
} = __non_webpack_require__('/lib/xp/i18n')
const {
  getMainSubjects
} = __non_webpack_require__( '/lib/ssb/utils/subjectUtils')


const partsWithPreview = [ // Parts that has preview
  `${app.name}:map`,
  `${app.name}:button`,
  `${app.name}:menuBox`,
  `${app.name}:accordion`,
  `${app.name}:highchart`,
  `${app.name}:keyFigure`,
  `${app.name}:menuDropdown`,
  `${app.name}:statistikkbanken`,
  `${app.name}:dataquery`,
  `${app.name}:factBox`,
  `${app.name}:contentList`,
  `${app.name}:omStatistikken`,
  `${app.name}:table`
]

const previewOverride = {
  'contentList': 'relatedFactPage'
}
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
  const pageType = page.page.config.pageType ? page.page.config.pageType : 'default'

  // Create preview if available
  let preview
  if (partsWithPreview.indexOf(page.type) >= 0) {
    let name = page.type.replace(/^.*:/, '')
    if (previewOverride[name]) {
      name = previewOverride[name]
    }
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

  let municipalPageType
  let addMetaInfoSearch = true
  let metaInfoSearchId = page._id
  let metaInfoSearchContentType = page._name
  let metaInfoSearchGroup = page._id
  let metaInfoSearchKeywords
  let metaInfoDescription
  let metaInfoSearchPublishFrom = page.publish.from
  let metaInfoMainSubject

  if (pageType === 'municipality') {
    if (page._path.indexOf('/kommunefakta/') > -1) {
      municipalPageType = 'kommunefakta'
    }
    if (page._path.indexOf('/kommuneareal/') > -1) {
      municipalPageType = 'kommuneareal'
    }
    if (page._path.indexOf('/barn-og-unge/') > -1) {
      municipalPageType = 'barn-og-unge'
    }
    metaInfoSearchContentType = 'kommunefakta'
    metaInfoSearchKeywords = 'kommune, kommuneprofil',
    metaInfoDescription = page.x['com-enonic-app-metafields']['meta-data'].seoDescription
  }

  if (pageType === 'municipality' && municipality) {
    addMetaInfoSearch = true
    metaInfoSearchId = metaInfoSearchId + '_' + municipality.code
    metaInfoSearchGroup = metaInfoSearchGroup + '_' + municipality.code
    metaInfoSearchKeywords = municipality.displayName + ' kommune'
  }

  if (pageType === 'factPage') {
    metaInfoSearchContentType = 'faktaside'
  }

  // Metainfo statistikk
  if (page.type === `${app.name}:statistics`) {
    const statistic = getStatisticByIdFromRepo(page.data.statistic)
    if (statistic) {
      const variants = util.data.forceArray(statistic.variants)
      const releaseDates = getReleaseDatesByVariants(variants)
      const previousRelease = releaseDates.previousRelease[0]
      metaInfoSearchPublishFrom = previousRelease ? new Date(previousRelease).toISOString() : new Date().toISOString()
    }
    metaInfoSearchContentType = 'statistikk'
    metaInfoDescription = page.x['com-enonic-app-metafields']['meta-data'].seoDescription
    metaInfoSearchKeywords = page.data.keywords ? page.data.keywords : ''
  }

  // Metainfo artikkel
  if (page.type === `${app.name}:article`) {
    const allMainSubjects = getMainSubjects(language.code === 'en' ? 'en' : 'nb' )

    allMainSubjects.forEach((mainSubject) => {
      if (page._path.startsWith(mainSubject.path)) {
        metaInfoMainSubject = mainSubject.title
      }
    })

    metaInfoSearchContentType = 'artikkel'
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

  const ieUrl = assetUrl({
    path: '/js/ie.js'
  })

  let pageContributions
  if (preview && preview.pageContributions) {
    pageContributions = preview.pageContributions
  }

  const menuCacheLanguage = language.code === 'en' ? 'en' : 'nb'
  const headerContent = fromMenuCache(req, `header_${menuCacheLanguage}`, () => {
    return getHeaderContent(language)
  })
  const headerComponent = new React4xp('Header')
    .setProps({
      ...headerContent,
      language: language
    })
    .setId('header')
  const header = {
    body: headerComponent.renderBody({
      body: '<div id="header"></div>'
    }),
    component: headerComponent
  }

  if (header && header.component) {
    pageContributions = header.component.renderPageContributions({
      pageContributions
    })
  }

  const footer = fromMenuCache(req, `footer_${menuCacheLanguage}`, () => {
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

  const breadcrumbs = getBreadcrumbs(page, municipality)

  const breadcrumbComponent = new React4xp('Breadcrumb')
  breadcrumbComponent.setProps({
    items: breadcrumbs
  })
    .setId('breadcrumbs')
    .uniqueId()

  const hideBreadcrumb = !!page.page.config.hide_breadcrumb

  const statbankFane = (req.params.xpframe === 'statbank')
  const baseUrl = app.config && app.config['ssb.baseUrl'] ? app.config['ssb.baseUrl'] : 'https://www.ssb.no'

  // Fjerner /ssb fra starten av path
  const pageUrl = baseUrl + page._path.substr(4)
  const pageLanguage = page.language ? page.language : 'nb'
  const statbankHelpLink = getSiteConfig().statbankHelpLink

  const statbankHelpText = localize({
    key: 'statbankHelpText',
    locale: pageLanguage === 'nb' ? 'no' : pageLanguage
  })
  const statbankMainFigures = localize({
    key: 'statbankMainFigures',
    locale: pageLanguage === 'nb' ? 'no' : pageLanguage
  })
  const statbankFrontPage = localize({
    key: 'statbankFrontPage',
    locale: pageLanguage === 'nb' ? 'no' : pageLanguage
  })

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
    ieUrl,
    language,
    statbankWeb: statbankFane,
    statbankHelpText,
    statbankHelpLink,
    statbankFrontPage,
    statbankMainFigures,
    pageUrl,
    GA_TRACKING_ID: app.config && app.config.GA_TRACKING_ID ? app.config.GA_TRACKING_ID : null,
    headerBody: header ? header.body : undefined,
    footerBody: footer ? footer.body : undefined,
    addMetaInfoSearch,
    metaInfoSearchId,
    metaInfoSearchGroup,
    metaInfoSearchContentType,
    metaInfoSearchKeywords,
    metaInfoDescription,
    metaInfoSearchPublishFrom,
    metaInfoMainSubject,
    breadcrumbsReactId: breadcrumbComponent.react4xpId,
    hideBreadcrumb
  }

  const thymeleafRenderBody = thymeleaf.render(view, model)

  const bodyWithBreadCrumbs = !hideBreadcrumb && breadcrumbComponent.renderBody({
    body: thymeleafRenderBody
  })

  if (!hideBreadcrumb) {
    pageContributions = breadcrumbComponent.renderPageContributions({
      pageContributions
    })
  }

  const alertOptions = page.page.config && page.page.config.pageType === 'municipality' ? {
    municipality,
    municipalPageType
  } : {
    pageType: page.type,
    pageTypeId: page._id,
    statbankWeb: statbankFane
  }
  const alerts = alertsForContext(page.page.config, alertOptions)
  const body = bodyWithBreadCrumbs ? bodyWithBreadCrumbs : thymeleafRenderBody
  const bodyWithAlerts = alerts.length ?
    addAlerts(alerts, body, pageContributions) :
    {
      body,
      pageContributions
    }

  return {
    body: `<!DOCTYPE html>${bodyWithAlerts.body}`,
    pageContributions: bodyWithAlerts.pageContributions
  }
}

function addAlerts(alerts, body, pageContributions ) {
  const alertComponent = new React4xp('Alerts')
    .setProps({
      alerts
    })
    .setId('alerts')
  return {
    body: alertComponent.renderBody({
      body
    }),
    pageContributions: alertComponent.renderPageContributions({
      pageContributions
    })
  }
}
