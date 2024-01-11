import * as http from '/lib/http-client'

function pad(num, size = 5) {
  const s = '00000' + num
  return s.substr(s.length - size)
}

export function get(req: XP.Request): XP.Response {
  if (!req.params.name) {
    return {
      body: {
        message: 'name parameter missing',
      },
      contentType: 'application/json',
    }
  }

  try {
    const { key, value } = req.params
    const query = req.params.key
    const json = (query && JSON.parse(query.data.json)) || {}

    if (json.query) {
      json.query.forEach((variable) => {
        if (variable.code === query.data.code) {
          variable.selection && (variable.selection.values = [value])
        }
      })
    }

    return http.request({
      method: 'POST',
      readTimeout: 10000,
      connectionTimeout: 20000,
      contentType: 'application/json',
      body: JSON.stringify(json, null, ' '),
      headers: { 'Cache-Control': 'no-cache' },
      url: `http://data.ssb.no/api/v0/no/table/${pad(query.data.table)}/`,
    })
  } catch (err) {
    return {
      body: err,
      status: err.status ? err.status : 500,
      contentType: 'application/json',
    }
  }
}
