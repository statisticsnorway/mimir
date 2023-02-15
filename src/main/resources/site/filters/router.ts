import { MunicipalityWithCounty } from '/lib/ssb/dataset/klass/municipalities'
import { get, Content } from '/lib/xp/content'

const { request } = __non_webpack_require__('/lib/http-client')
const { pageUrl, getSite } = __non_webpack_require__('/lib/xp/portal')
const { fromFilterCache } = __non_webpack_require__('/lib/ssb/cache/cache')
const { getMunicipalityByName, municipalsWithCounties } = __non_webpack_require__(
  '/lib/ssb/dataset/klass/municipalities'
)

exports.filter = function (req: XP.Request, next: (req: XP.Request) => XP.Response): XP.Response {
  if (req.params.selfRequest) return next(req)
  const paramKommune: string | undefined = req.params.kommune
  const region: string | undefined = paramKommune ?? req.path.split('/').pop()
  const municipality: MunicipalityWithCounty | undefined = getMunicipalityByName(
    municipalsWithCounties(),
    region as string
  )
  if (!municipality && region !== 'kommune') {
    return next(req)
  }
  const pageTitle = createPageTitle(req.path, municipality)

  if (paramKommune) {
    log.info('Kommuneside via apache, kommune: ' + paramKommune + ' Request Url: ' + req.url)
    req.params = {
      selfRequest: 'true',
      municipality: JSON.stringify(municipality),
      pageTitle,
    }
    return next(req)
  }

  const targetId: string | null = getTargetId(req.path)

  if (!targetId) {
    return next(req)
  }

  const targetUrl: string = pageUrl({
    id: targetId,
  })

  const targetResponse: XP.Response = fromFilterCache(req, targetId, req.path, () => {
    const headers: Headers = req.headers
    delete headers['Accept-Encoding']
    delete headers['Connection'] // forbidden header name for http/2 and http/3
    delete headers['Host']

    return request({
      url: `http://localhost:8080${targetUrl}`,
      headers,
      params: {
        selfRequest: 'true',
        municipality: JSON.stringify(municipality),
        pageTitle,
      },
      connectionTimeout: 20000,
      readTimeout: 60000,
    })
  })

  if (pageTitle) {
    const site: Content = getSite()
    targetResponse.body = (targetResponse.body as string).replace(
      /(<title>)(.*?)(<\/title>)/i,
      `<title>${pageTitle} - ${site.displayName}</title>`
    )
  }

  log.info('Kommuneside via targetResponse, kommune: ' + region + ' Request Url: ' + req.url)
  return {
    body: targetResponse.body,
  }
}

function createPageTitle(path: string, municipality: MunicipalityWithCounty | undefined): string {
  let pageTitle = ''
  if (path.indexOf('/kommunefakta/') > -1) {
    pageTitle = `Kommunefakta ${municipality ? municipality.displayName : ''}`
  } else if (path.indexOf('/kommuneareal/') > -1) {
    pageTitle = `Kommuneareal ${municipality ? municipality.displayName : ''}`
  } else if (path.indexOf('/barn-og-unge/') > -1) {
    pageTitle = `Barn og unge ${municipality ? municipality.displayName : ''}`
  } else if (path.indexOf('/jakt-i-din-kommune/') > -1) {
    pageTitle = `Jakt i din kommune ${municipality ? municipality.displayName : ''}`
  } else {
    pageTitle = ''
  }
  return pageTitle
}

function getTargetId(path: string): string | null {
  let targetId: string | null = null
  if (path.indexOf('/kommunefakta/') > -1) {
    targetId = (
      get({
        key: '/ssb/kommunefakta/kommune',
      }) as Content
    )._id
  } else if (path.indexOf('/kommuneareal/') > -1) {
    targetId = (
      get({
        key: '/ssb/kommuneareal/kommune',
      }) as Content
    )._id
  } else if (path.indexOf('/barn-og-unge/') > -1) {
    targetId = (
      get({
        key: '/ssb/barn-og-unge/kommune',
      }) as Content
    )._id
  } else if (path.indexOf('/jakt-i-din-kommune/') > -1) {
    targetId = (
      get({
        key: '/ssb/jakt-i-din-kommune/kommune',
      }) as Content
    )._id
  } else {
    targetId = null
  }
  return targetId
}

// XP.Request.headers type is set as readonly; we have to define our own type to delete the desired properties
type Headers = {
  [key: string]: string | undefined
}
