import { HttpResponse, HttpRequestParams } from '/lib/http-client' 
const {
  Events, logUserDataQuery
} = __non_webpack_require__('/lib/ssb/repo/query')
const {
  request
} = __non_webpack_require__('/lib/http-client')
const {
  sleep
} = __non_webpack_require__('/lib/xp/task')

const defaultSelectionFilter: SelectionFilter = {
  filter: 'all',
  values: ['*']
}

export function get(url: string, json: DataqueryRequestData | undefined,
  selection: SelectionFilter = defaultSelectionFilter, queryId?: string ): object | null {
  if (json && json.query) {
    for (const query of json.query) {
      if (query.code === 'KOKkommuneregion0000' || query.code === 'Region') {
        query.selection = selection
      }
    }
  }
  const method: string = json && json.query ? 'POST' : 'GET'
  const requestParams: HttpRequestParams = {
    url,
    method,
    contentType: 'application/json',
    headers: {
      'Cache-Control': 'no-cache',
      'Accept': 'application/json'
    },
    connectionTimeout: 20000,
    readTimeout: 5000,
    body: json ? JSON.stringify(json) : ''
  }

  if (queryId) {
    logUserDataQuery(queryId, {
      file: '/lib/dataquery.ts',
      function: 'get',
      message: Events.REQUEST_DATA,
      request: requestParams
    })
  }

  const result: HttpResponse = request(requestParams)

  if (result.status !== 200) {
    log.error(`HTTP ${url} (${result.status} ${result.message})`)
    if (queryId) {
      logUserDataQuery(queryId, {
        file: '/lib/dataquery.ts',
        function: 'get',
        message: Events.REQUEST_GOT_ERROR_RESPONSE,
        response: result,
        info: url
      })
    }
  }

  if (result.status === 429) { // 429 = too many requests
    sleep(30 * 1000)
  }

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

// TODO create issue for enonic-types where read-only is blocking modify
/* interface ModifyContent<A extends object> extends Content<A> {
  displayName: string;
}*/

export interface KlassRequestLib {
  get: (url: string, json: DataqueryRequestData | undefined, selection?: SelectionFilter, queryId?: string ) => object | null;
}

