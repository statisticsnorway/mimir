const {
  pageUrl,
  getSite
} = __non_webpack_require__('/lib/xp/portal')
const {
  get
} = __non_webpack_require__('/lib/xp/content')
const {
  request
} = __non_webpack_require__( '/lib/http-client')
const {
  fromFilterCache
} = __non_webpack_require__('/lib/ssb/cache')
const {
  getMunicipalityByName,
  municipalsWithCounties
} = __non_webpack_require__('/lib/klass/municipalities')


exports.filter = function(req, next) {
  if (req.params.selfRequest) return next(req)
  delete req.headers['Accept-Encoding']
  let pageTitle = ''
  const region = req.path.split('/').pop()
  const municipality = getMunicipalityByName(municipalsWithCounties(), region)
  if (!municipality && region !== 'kommune') {
    return next(req)
  }

  let targetId = null
  if (req.path.indexOf('/kommunefakta/') > -1) {
    targetId = get({
      key: '/ssb/kommunefakta/kommune'
    })._id
    pageTitle = `Kommunefakta ${municipality ? municipality.displayName : ''}`
  } else if (req.path.indexOf('/kommuneareal/') > -1) {
    targetId = get({
      key: '/ssb/kommuneareal/kommune'
    })._id
    pageTitle = `Kommuneareal ${municipality ? municipality.displayName : ''}`
  }

  if (!targetId) {
    return next(req)
  }

  const targetUrl = pageUrl({
    id: targetId
  })

  const targetResponse = fromFilterCache(req, targetId, req.path, () => {
    return request({
      url: `http://localhost:8080${targetUrl}`,
      headers: req.headers,
      cookies: req.cookies,
      params: {
        selfRequest: true,
        municipality: JSON.stringify(municipality),
        pageTitle
      },
      connectionTimeout: 5000,
      readTimeout: 60000
    })
  })

  if (pageTitle) {
    const site = getSite()
    targetResponse.body = targetResponse.body.replace(/(<title>)(.*?)(<\/title>)/i, `<title>${pageTitle} - ${site.displayName}</title>`)
  }

  return {
    body: targetResponse.body
  }
}
