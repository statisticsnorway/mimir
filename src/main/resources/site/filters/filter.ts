import { MunicipalityWithCounty } from '/lib/ssb/dataset/klass/municipalities'

const { getMunicipalityByName, municipalsWithCounties } = __non_webpack_require__(
  '/lib/ssb/dataset/klass/municipalities'
)

exports.filter = function (req: XP.Request, next: (req: XP.Request) => XP.Response): XP.Response {
  if (req.params.selfRequest) return next(req)
  const region: string | undefined = req.path.split('/').pop()
  const municipality: MunicipalityWithCounty | undefined = getMunicipalityByName(
    municipalsWithCounties(),
    region as string
  )
  if (!municipality && region !== 'kommune') {
    return next(req)
  }
  const newUrl: string | undefined = createMunicipalityPath(req.url)
  const newPath: string | undefined = createMunicipalityPath(req.path)
  const newRawPath: string | undefined = createMunicipalityPath(req.rawPath)
  const pageTitle = createPageTitle(req.path, municipality)
  req.url = newUrl ? newUrl : req.url
  req.path = newPath ? newPath : req.path
  req.rawPath = newRawPath ? newRawPath : req.rawPath
  req.params = {
    selfRequest: 'true',
    municipality: JSON.stringify(municipality),
    pageTitle,
  }

  //log.info('REQUEST ETTER: ' + JSON.stringify(req, null, 4))

  const response: XP.Response = next(req)
  return response
}

function createMunicipalityPath(path: string): string | undefined {
  const municipalityName: string | undefined = path.split('/').pop()
  const result: string | undefined =
    municipalityName && municipalityName !== 'kommune' ? path.replace(`/${municipalityName}`, '/kommune') : path
  return result
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
  }
  return pageTitle
}
