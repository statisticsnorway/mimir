import { MunicipalityWithCounty } from '/lib/ssb/dataset/klass/municipalities'
import { get, Site, Content } from '/lib/xp/content'

const {
  request
} = __non_webpack_require__('/lib/http-client')
const {
  pageUrl,
  getSite
} = __non_webpack_require__('/lib/xp/portal')
const {
  fromFilterCache
} = __non_webpack_require__('/lib/ssb/cache/cache')
const {
  getMunicipalityByName,
  municipalsWithCounties
} = __non_webpack_require__('/lib/ssb/dataset/klass/municipalities')

exports.filter = function(req: XP.Request, next: (req: XP.Request) => XP.Response): XP.Response {
  if (req.params.selfRequest) return next(req)
  const headers: Headers = req.headers
  delete headers['Accept-Encoding']
  let pageTitle: string = ''
  const region: string | undefined = req.path.split('/').pop()
  const municipality: MunicipalityWithCounty | undefined = getMunicipalityByName(municipalsWithCounties(), region as string)
  if (!municipality && region !== 'kommune') {
    return next(req)
  }

  let targetId: string | null = null
  if (req.path.indexOf('/kommunefakta/') > -1) {
    targetId = (get({
      key: '/ssb/kommunefakta/kommune'
    }) as Content)._id
    pageTitle = `Kommunefakta ${municipality ? municipality.displayName : ''}`
  } else if (req.path.indexOf('/kommuneareal/') > -1) {
    targetId = (get({
      key: '/ssb/kommuneareal/kommune'
    }) as Content)._id
    pageTitle = `Kommuneareal ${municipality ? municipality.displayName : ''}`
  } else if (req.path.indexOf('/barn-og-unge/') > -1) {
    targetId = (get({
      key: '/ssb/barn-og-unge/kommune'
    }) as Content)._id
    pageTitle = `Barn og unge ${municipality ? municipality.displayName : ''}`
  }

  if (!targetId) {
    return next(req)
  }

  const targetUrl: string = pageUrl({
    id: targetId
  })

  const targetResponse: XP.Response = fromFilterCache(req, targetId, req.path, () => {
    const headers: Headers = req.headers
    delete headers['Connection'] // forbidden header name for http/2 and http/3
    delete headers['Host']

    return request({
      url: `http://localhost:8080${targetUrl}`,
      headers,
      params: {
        selfRequest: 'true',
        municipality: JSON.stringify(municipality),
        pageTitle
      },
      connectionTimeout: 10000,
      readTimeout: 60000
    })
  })

  if (pageTitle) {
    const site: Content = getSite()
    targetResponse.body = (targetResponse.body as string).replace(/(<title>)(.*?)(<\/title>)/i, `<title>${pageTitle} - ${site.displayName}</title>`)
  }

  return {
    body: targetResponse.body
  }
}

// XP.Request.headers type is set as readonly; we have to define our own type to delete the desired properties
type Headers = {
  [key: string]: string | undefined
}
