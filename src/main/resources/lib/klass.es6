import * as util from '/lib/util'
import * as http from '/lib/http-client'
import * as portal from '/lib/xp/portal'
import * as content from '/lib/xp/content'

const paths = {}
const codes = {}
const method = 'GET'
const readTimeout = 5000
const connectionTimeout = 20000
const headers = { 'Cache-Control': 'no-cache', 'Accept': 'application/json' }
const contentType = 'application/json'

exports.getMunicipality = function(req) {
  if (Object.keys(paths).length === 0) {
    const part = {}
    const page = portal.getContent()
    const site = page._path.replace(/\/.*/, '')
    const dropdown = content.query( { contentTypes: [`${app.name}:menu-dropdown`], count: 1, query: `_path LIKE '${site}/*'` })
    if (dropdown && dropdown.count) {
      const menu = dropdown.hits[0]
      if (menu && menu.data.source) {
        menu.data.source = util.data.forceArray(menu.data.source)
        menu.data.source.forEach((url) => {
          const result = http.request({ url, method, headers, connectionTimeout, readTimeout, contentType })
          if (result && result.status === 200) {
            const value = JSON.parse(result.body); // semicolon required
            (part.values || (part.values = [])).push(value)
          }
        })
        if (part.values && part.values.length === 2) {
          const map = {}
          const count = {}
          const municipalities = part.values[0] // inferred
          const counties = part.values[1] // inferred
          counties.codes.forEach((county) => map[county.code] = county)
          municipalities.codes.forEach((municipality) => count[municipality.name] = typeof count[municipality.name] === 'undefined' ? 1 : count[municipality.name] + 1)
          municipalities.codes.forEach((municipality) => {
            municipality.count = count[municipality.name]
            municipality.countyCode = municipality.code.replace(/^(\d\d).*$/, '$1')
            municipality.county = map[municipality.countyCode]
            municipality.displayName = municipality.count === 1 ? municipality.name : municipality.name + ' i ' + map[municipality.countyCode].name
            municipality.path = (municipality.count === 1 ? municipality.name : municipality.name + '-' + map[municipality.countyCode].name)
            municipality.path = municipality.path.replace(/ /g, '-').replace(/-+/g, '-').toLowerCase()
            municipality.path = municipality.path.replace(/å/g, 'a').replace(/æ/g, 'ae').replace(/á/g, 'a').replace(/ø/g, 'o')
            paths[municipality.path] = municipality
            codes[municipality.code] = municipality
          })
        }
      }
    }
  }
  if (req.code) {
    return codes[req.code]
  }
  const name = req.path && req.path.replace(/^.*\//, '')
  return Object.keys(paths).length && paths[name]
}

exports.get = function(url) {
  // TODO: Cache result
  return http.request({ url, method, headers, connectionTimeout, readTimeout, body: JSON.stringify(json, null, ''), contentType })
}


/**
 * Parse a dataset into this structure { municipalCode: { label: "String", value: number }}
 * For instance: { 0213: { label: "toten", value: 13434 }}
 * @param {object} data
 * @param {object} table
 * @return {object}
 */
exports.datasetToMunicipalityWithValues = function(data, table = {}) {
  const labels = data.dimension[Object.keys(data.dimension)[0]].category.label
  const categories = data.dimension[Object.keys(data.dimension)[0]].category

  for (const key in labels) {
    if (labels.hasOwnProperty(key)) {
      const i = categories.index[key]
      table[key] = { label: labels[key], value: data.value[i] }
    }
  }
  return table
}
