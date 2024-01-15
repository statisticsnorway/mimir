import * as http from '/lib/http-client'

function pad(num, size = 5) {
  const s = '00000' + num
  return s.substr(s.length - size)
}

// TODO: Tror denne ikke trengs likevel
export function get(req: XP.Request): XP.Response {
  // TODO: Denne tok opprinnelig imot valgt verdi og id til content og så hentet den selv ut alle parameterne satt for contentet. Tror det er bedre måte å gjøre det på?

  try {
    // TODO Denne må få inn table, query, code og valgt verdi
    // HArdkodede verdier:
    const value = '2355'
    const json = {
      query: [
        {
          code: 'MaaleMetode',
          selection: {
            filter: 'item',
            values: ['02'],
          },
        },
        {
          code: 'Yrke',
          selection: {
            filter: 'vs:NYK08Lonnansatt',
            values: ['0210'],
          },
        },
        {
          code: 'Sektor',
          selection: {
            filter: 'item',
            values: ['ALLE'],
          },
        },
        {
          code: 'Kjonn',
          selection: {
            filter: 'item',
            values: ['0'],
          },
        },
        {
          code: 'AvtaltVanlig',
          selection: {
            filter: 'item',
            values: ['5'],
          },
        },
        {
          code: 'ContentsCode',
          selection: {
            filter: 'item',
            values: ['Manedslonn'],
          },
        },
        {
          code: 'Tid',
          selection: {
            filter: 'item',
            values: ['2021'],
          },
        },
      ],
      response: {
        format: 'json-stat',
      },
    }
    const table = '11418'
    const code = 'Yrke'

    // const { key, value } = req.params
    // const query = req.params.key
    // const json = (query && JSON.parse(query.data.json)) || {}

    if (json.query) {
      json.query.forEach((variable) => {
        if (variable.code === code) {
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
      url: `http://data.ssb.no/api/v0/no/table/${pad(table)}/`,
    })
  } catch (err) {
    return {
      body: err,
      status: err.status ? err.status : 500,
      contentType: 'application/json',
    }
  }
}
