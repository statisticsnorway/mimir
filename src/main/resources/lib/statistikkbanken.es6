// Does a query to statustikkbanken on requested url

import * as http from '/lib/http-client'

const method = 'POST'
const readTimeout = 5000
const connectionTimeout = 20000
const headers = { 'Cache-Control': 'no-cache' }
const contentType = 'application/json'

exports.get = function(url, json, selection = { filter: 'all', values: ['*'] }) {
  if (json.query && json.query[0] && json.query[0].selection && json.query[0].selection) {
    json.query[0].selection = selection
  }
  const result = http.request({ url, method, headers, connectionTimeout, readTimeout, body: JSON.stringify(json, null, ''), contentType })
  result.status !== 200 && log.error(`HTTP ${url} (${result.status} ${result.message})`)
  result.status !== 200 && log.error(JSON.stringify(json, null, ' '))
  result.status !== 200 && log.info(JSON.stringify(result, null, ' '))
  return result.status === 200 && JSON.parse(result.body)
}
