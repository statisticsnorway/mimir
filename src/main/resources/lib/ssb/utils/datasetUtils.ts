import { sleep } from '/lib/xp/task'
import { request, HttpResponse, HttpRequestParams } from '/lib/http-client'
import { type JSONstat } from '/lib/types/jsonstat-toolkit'
import { Events, logUserDataQuery } from '/lib/ssb/repo/query'

const defaultSelectionFilter: SelectionFilter = {
  filter: 'all',
  values: ['*'],
}

export function get(
  url: string,
  json: DataqueryRequestData | undefined,
  selection: SelectionFilter = defaultSelectionFilter,
  queryId?: string,
  noDefaultFilterRegion?: boolean
): JSONstat | object | null {
  if (json?.query && !noDefaultFilterRegion) {
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
    log.warning(`HTTP 429 - attempt nr${retryCount} - ${url} (${result.message})`)
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
