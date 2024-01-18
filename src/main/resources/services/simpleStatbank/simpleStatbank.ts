import { request } from '/lib/http-client'

function pad(num, size = 5) {
  const s = '00000' + num
  return s.substr(s.length - size)
}

export const get = (req: XP.Request): XP.Response => {
  const { code, table } = req.params
  const json = req.body

  // if (json.query) {
  //   json.query.forEach((variable) => {
  //     if (variable.code === query.data.code) {
  //       variable.selection && (variable.selection.values = [value])
  //     }
  //   })
  // }

  // return {
  //   status: 200,
  //   contentType: 'application/json',
  //   body: 'test',
  // }

  return request({
    method: 'POST',
    readTimeout: 10000,
    connectionTimeout: 20000,
    contentType: 'application/json',
    body: JSON.stringify(json, null, ' '),
    headers: { 'Cache-Control': 'no-cache' },
    url: `http://data.ssb.no/api/v0/no/table/${pad(table)}/`,
  })
}
