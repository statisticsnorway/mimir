const http = __non_webpack_require__( '/lib/http-client')

const readTimeout = 5000
const connectionTimeout = 20000
const headers = { 'Cache-Control': 'no-cache', 'Accept': 'application/json' }
const contentType = 'application/json'

exports.get = function (url, json, selection = { filter: 'all', values: ['*'] }) {
  if (json && json.query) {
    for (const query of json.query) {
      if (query.code === 'KOKkommuneregion0000' || query.code === 'Region') {
        query.selection = selection
      }
    }
  }
  const method = json && json.query ? 'POST' : 'GET'
  const result = http.request({ url, method, headers, connectionTimeout, readTimeout, body: JSON.stringify(json, null, ''), contentType })
  result.status !== 200 && log.error(`HTTP ${url} (${result.status} ${result.message})`)
  result.status !== 200 && log.info(JSON.stringify(json, null, ' '))
  result.status !== 200 && log.info(JSON.stringify(result, null, ' '))
  return result.status === 200 && JSON.parse(result.body)
}
