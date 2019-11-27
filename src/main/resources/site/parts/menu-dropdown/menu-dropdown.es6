import * as util from '/lib/util'
import * as http from '/lib/http-client'
import * as klass from '/lib/klass'
import * as portal from '/lib/xp/portal'
import * as content from '/lib/xp/content'
import * as thymeleaf from '/lib/thymeleaf'
import * as municipals from '/lib/municipals'

const view = resolve('./menu-dropdown.html')
const method = 'GET'
const readTimeout = 5000
const connectionTimeout = 20000
const headers = { 'Cache-Control': 'no-cache', 'Accept': 'application/json' }
const contentType = 'application/json'

exports.get = function(req) {
  const map = {}
  const page = portal.getContent()
  const part = portal.getComponent() || req
  const mode = municipals.mode(req, page)

  const municipality = klass.getMunicipality(req)

  part.config.menu = util.data.forceArray(part.config.menu || part.config['menu-dropdown'] || [])
  part.config.menu.map((key) => {
     const menu = content.get({ key })
     if (menu && menu.data.source) {
       menu.data.source = util.data.forceArray(menu.data.source)
       menu.data.source.map((url) => {
         // TODO: Get data from saved dataset (todo)
         const result = http.request({ url, method, headers, connectionTimeout, readTimeout, contentType })
         if (result && result.status === 200) {
           const value = JSON.parse(result.body); // semicolon required
           (part.values || (part.values = [])).push(value)
         }
       })
       if (part.values && part.values.length === 2) {
         const count = {}
         const municipalities = part.values[0] // inferred
         const counties = part.values[1] // inferred
         counties.codes.map((county) => {
           map[county.code] = county
         })
         municipalities.codes.map((municipality) => {
           count[municipality.name] = typeof count[municipality.name] === 'undefined' ? 1 : count[municipality.name] + 1
         })
         municipalities.codes.map((municipality) => {
           municipality.count = count[municipality.name]
           municipality.county = municipality.code.replace(/^(\d\d).*$/, '$1')
           municipality.displayName = municipality.count === 1 ? municipality.name : municipality.name + ' i ' + map[municipality.county].name
           municipality.path = '/' + (municipality.count === 1 ? municipality.name : municipality.name + '-' + map[municipality.county].name)
           municipality.path = municipality.path.replace(/ /g, '-').replace(/-+/g, '-').toLowerCase()
           municipality.path = municipality.path.replace(/å/g, 'a').replace(/æ/g, 'ae').replace(/á/g, 'a').replace(/ø/g, 'o')
         })
         menu.municipalities = municipalities
       }
     }
     (part.menu || (part.menu = [])).push(menu)
  })

  // log.info(JSON.stringify(part, null, ' '))

  const model = { page, municipality, part, map, mode }
  const body = thymeleaf.render(view, model)

  return { body, contentType: 'text/html' }
}
