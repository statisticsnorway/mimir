import { getMunicipality } from '/lib/klass'
import { getContent } from '/lib/xp/portal'
import { render } from '/lib/thymeleaf'
import { list as municipalityList, createPath } from '/lib/municipals'
import { list as countyList } from '/lib/counties'
import { newCache } from '/lib/cache'
import { mode } from '/lib/municipals'

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
    mode: mode(req, page),
    page: {
      displayName: page.displayName,
      _id: page._id
    },
    currentMunicipality: getMunicipality(req),
    municipalities: parsedMunicipalities
  }

  return { body: render(view, model), contentType: 'text/html' }
}
