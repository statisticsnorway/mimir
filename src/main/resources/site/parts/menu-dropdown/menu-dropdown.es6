const { getMunicipality } = __non_webpack_require__( '/lib/klass')
const { getContent } = __non_webpack_require__( '/lib/xp/portal')
const { render } = __non_webpack_require__( '/lib/thymeleaf')
const { list : municipalityList, createPath } = __non_webpack_require__( '/lib/municipals')
const { list : countyList } = __non_webpack_require__( '/lib/counties')
const { newCache } = __non_webpack_require__( '/lib/cache')
const { mode } = __non_webpack_require__( '/lib/municipals')

const view = resolve('./menu-dropdown.html')
const cache = newCache({ size: 100, expire: 3600 })

exports.get = (req) => renderPart(req)

exports.preview = (req, id) => renderPart(req)

function renderPart(req) {
  const counties = countyList();
  const municipalities = municipalityList()

  // Caching this since it is a bit heavy
  const parsedMunicipalities = cache.get('parsedMunicipality', () => municipalities.map( (municipality) => {
    const getTwoFirstDigits = /^(\d\d).*$/
    const currentCounty = counties.filter( (county) => county.code === municipality.code.replace(getTwoFirstDigits, '$1'))[0]
    const numMunicipalsWithSameName = municipalities.filter( (mun) => mun.name === municipality.name).length

    return {
      code: municipality.code,
      displayName: numMunicipalsWithSameName === 1 ? municipality.name : `${municipality.name} i ${currentCounty.name}`,
      county: {
        name: currentCounty.name
      },
      path: numMunicipalsWithSameName === 1 ? createPath(municipality.name) : createPath(municipality.name, currentCounty.name)
    }
  }))

  const page = getContent()
  const model = {
    mode: mode(req, page),
    page: {
      displayName: page.displayName,
      _id: page._id
    },
    municipality: getMunicipality(req),
    municipalities: parsedMunicipalities
  }

  return { body: render(view, model), contentType: 'text/html' }
}
