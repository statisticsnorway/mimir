import { request, HttpResponse, HttpRequestParams } from '/lib/http-client'
import { JSONstat } from '/lib/types/jsonstat-toolkit'
const { Events, logUserDataQuery } = __non_webpack_require__('/lib/ssb/repo/query')
const { sleep } = __non_webpack_require__('/lib/xp/task')

const defaultSelectionFilter: SelectionFilter = {
  filter: 'all',
  values: ['*'],
}

export function get(
  url: string,
  json: DataqueryRequestData | undefined,
  selection: SelectionFilter = defaultSelectionFilter,
  queryId?: string
): JSONstat | object | null {
  if (json?.query) {
    for (const query of json.query) {
      if (query.code === 'KOKkommuneregion0000' || query.code === 'Region') {
        query.selection = selection
      }
    }
  }
  const method = json?.query ? 'POST' : 'GET'
  const requestParams: HttpRequestParams = {
    url,
    method,
    contentType: 'application/json',
    headers: {
      'Cache-Control': 'no-cache',
      Accept: 'application/json',
    },
    connectionTimeout: 60000,
    readTimeout: 5000,
    body: json ? JSON.stringify(json) : '',
  }

  if (queryId) {
    logUserDataQuery(queryId, {
      file: '/lib/dataquery.ts',
      function: 'get',
      message: Events.REQUEST_DATA,
      request: requestParams,
    })
  }
  let result: HttpResponse = request(requestParams)
  let retryCount = 0

  // 429 = too many requests
  while (retryCount < 3 && result.status === 429) {
    sleep(60 * 1000)
    result = request(requestParams)
    retryCount++
    log.warn(`HTTP 429 - attempt nr${retryCount + 1} - ${url} (${result.message})`)
  }

  // We are limited to 30 requests per minute, sleep a bit for each request
  sleep(3000)

  if (result.status === 200 && result.body) {
    return JSON.parse(result.body)
  }

  log.error(`HTTP ${url} (${result.status} ${result.message})`)
  if (queryId) {
    logUserDataQuery(queryId, {
      file: '/lib/dataquery.ts',
      function: 'get',
      message: Events.REQUEST_GOT_ERROR_RESPONSE,
      response: result,
      info: url,
    })
  }
  return null
}

export interface SelectionFilter {
  filter: string
  values: Array<string>
}

export interface DataqueryRequestData {
  query: Array<Dimension>
  response: {
    format: string
  }
}

export interface Dimension {
  code: string
  selection: SelectionFilter
}
