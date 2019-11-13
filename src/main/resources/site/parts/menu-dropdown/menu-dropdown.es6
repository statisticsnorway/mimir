const { getMunicipality } = require( '/lib/klass')
const { getContent } = require('/lib/xp/portal')
const { render } = require('/lib/thymeleaf')
const { list: municipalityList, createPath } = require('/lib/municipals')
const { list: countyList } = require('/lib/counties')
const { newCache } = require('/lib/cache')

const view = resolve('./menu-dropdown.html')
const cache = newCache({ size: 100, expire: 3600 })


exports.get = function(req) {
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
    page: {
      displayName: page.displayName,
      _id: page._id
    },
    currentMunicipality: getMunicipality(req),
    municipalities: parsedMunicipalities
  }

  return { body: render(view, model), contentType: 'text/html' }
}
