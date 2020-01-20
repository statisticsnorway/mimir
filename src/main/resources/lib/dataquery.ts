import { HttpResponse, HttpLibrary } from 'enonic-types/lib/http'
const http: HttpLibrary = __non_webpack_require__( '/lib/http-client')

export function get(url: string, json: DataqueryRequestData, selection: SelectionFilter = {
  filter: 'all',
  values: ['*']
}): object | null {
  if (json && json.query) {
    for (const query of json.query) {
      if (query.code === 'KOKkommuneregion0000' || query.code === 'Region') {
        query.selection = selection
      }
    }
  }
  const method: string = json && json.query ? 'POST' : 'GET'
  const result: HttpResponse = http.request({
    url,
    method,
    contentType: 'application/json',
    headers: {
      'Cache-Control': 'no-cache',
      'Accept': 'application/json'
    },
    connectionTimeout: 20000,
    readTimeout: 5000,
    body: JSON.stringify(json, null, '')
  })
  result.status !== 200 && log.error(`HTTP ${url} (${result.status} ${result.message})`)
  result.status !== 200 && log.info(JSON.stringify(json, null, ' '))
  result.status !== 200 && log.info(JSON.stringify(result, null, ' '))
  if (result.status === 200 && result.body) {
    return JSON.parse(result.body)
  }
  return null
}

export interface SelectionFilter {
  filter: string;
  values: Array<string>;
}

export interface DataqueryRequestData {
  query: Array<Dimension>;
  response: {
    format: string;
  };
}

export interface Dimension {
  code: string;
  selection: SelectionFilter;
}
