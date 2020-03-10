const moment = require('moment/min/moment-with-locales')

const {
  getMunicipality
} = __non_webpack_require__( '/lib/klass/municipalities')
const {
  getContent,
  assetUrl,
  pageUrl
} = __non_webpack_require__( '/lib/xp/portal')
const thymeleaf = __non_webpack_require__( '/lib/thymeleaf')
const languageLib = __non_webpack_require__( '/lib/language')
const {
  alertsForContext
} = __non_webpack_require__( '/lib/ssb/utils')

const version = '%%VERSION%%'
const preview = [
  `${app.name}:accordion`,
  `${app.name}:menuBox`,
  `${app.name}:button`,
  `${app.name}:highchart`,
  `${app.name}:statistikkbanken`,
  `${app.name}:dashboard`,
  `${app.name}:keyFigure`
]

const view = resolve('article.html')

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
  const bottomRegion = isFragment ? null : page.page && page.page.regions && page.page.regions.bottom
  const config = {}
  const municipality = getMunicipality(req)
  const language = languageLib.getLanguage(page)
  let alternateLanguageVersionUrl
  if (language.exists) {
    alternateLanguageVersionUrl = pageUrl({
      path: language.path
    })
  }

  // Create preview
  if (preview.indexOf(page.type) >= 0) {
    const name = page.type.replace(/^.*:/, '')
    const controller = __non_webpack_require__(`../../parts/${name}/${name}`)
    if (controller.preview) {
      page.preview = controller.preview(req, page._id)
    }
  }

  const publishedDatetime = page.publish && page.publish.from && moment(page.publish.from).format('YYYY-MM-DD HH:MM')
  const modifiedDatetime = moment(page.modifiedTime).format('YYYY-MM-DD HH:MM')

  page.displayNameURLencoded = encodeURI(page.displayName)
  page.url = encodeURI(pageUrl({
    type: 'absolute',
    id: page._id
  }))

  const alerts = alertsForContext(municipality)

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

  const model = {
    version,
    ts,
    config,
    page,
    mainRegion,
    bottomRegion,
    publishedDatetime,
    modifiedDatetime,
    alerts,
    language,
    alternateLanguageVersionUrl,
    stylesUrl,
    jsLibsUrl,
    bannerUrl,
    logoUrl
  }
  const body = thymeleaf.render(view, model)

  return {
    body
  }
}
