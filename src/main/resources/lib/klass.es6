import * as http from '/lib/http-client'

const method = 'GET'
const readTimeout = 5000
const connectionTimeout = 20000
const headers = { 'Cache-Control': 'no-cache' }
const contentType = 'application/json'

exports.get = function(url) {
  // TODO: Cache result
  return http.request({ url, method, headers, connectionTimeout, readTimeout, body: JSON.stringify(json, null, ''), contentType })
}
