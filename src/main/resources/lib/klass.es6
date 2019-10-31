import * as util from '/lib/util'
import * as http from '/lib/http-client'
import * as portal from '/lib/xp/portal'
import * as content from '/lib/xp/content'

const paths = {}
const method = 'GET'
const readTimeout = 5000
const connectionTimeout = 20000
const headers = { 'Cache-Control': 'no-cache', Accept: 'application/json' }
const contentType = 'application/json'

exports.getMunicipality = function(req) {
  if (Object.keys(paths).length === 0) {
    const part = {}
    const page = portal.getContent()
    const dropdown = content.query( { contentTypes: [`${app.name}:menu-dropdown`], count: 1, query: `_path LIKE '/content${page._path}/*'` })
    if (dropdown && dropdown.count) {
      const menu = dropdown.hits[0]
      if (menu && menu.data.source) {
        menu.data.source = util.data.forceArray(menu.data.source)
        menu.data.source.map((url) => {
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
          counties.codes.map((county) => map[county.code] = county)
          municipalities.codes.map((municipality) => count[municipality.name] = typeof count[municipality.name] === 'undefined' ? 1 : count[municipality.name] + 1)
          municipalities.codes.map((municipality) => {
            municipality.count = count[municipality.name]
            municipality.countyCode = municipality.code.replace(/^(\d\d).*$/, '$1')
            municipality.county = map[municipality.countyCode]
            municipality.displayName = municipality.count === 1 ? municipality.name : municipality.name + ' i ' + map[municipality.countyCode].name
            municipality.path = (municipality.count === 1 ? municipality.name : municipality.name + '-' + map[municipality.countyCode].name)
            municipality.path = municipality.path.replace(/ /g, '-').replace(/-+/g, '-').toLowerCase()
            municipality.path = municipality.path.replace(/å/g, 'a').replace(/æ/g, 'ae').replace(/á/g, 'a').replace(/ø/g, 'o')
            paths[municipality.path] = municipality
          })
        }
      }
    }
  }
  const name = req.path.replace(/^.*\//, '')
  return paths[name]
}

exports.get = function(url) {
  // TODO: Cache result
  return http.request({ url, method, headers, connectionTimeout, readTimeout, body: JSON.stringify(json, null, ''), contentType })
}
