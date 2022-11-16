import { request, HttpRequestParams, HttpResponse } from '/lib/http-client'

const { Events, logUserDataQuery } = __non_webpack_require__('/lib/ssb/repo/query')

export function fetchStatRegData(dataKey: string, serviceUrl: string): HttpResponse {
  const requestParams: HttpRequestParams = {
    url: serviceUrl,
    method: 'GET',
    contentType: 'application/json',
    headers: {
      'Cache-Control': 'no-cache',
      Accept: 'application/json',
    },
    connectionTimeout: 30000,
    readTimeout: 30000,
  }
  const response: HttpResponse = request(requestParams)

  logUserDataQuery(dataKey, {
    file: '/lib/ssb/statreg/common.ts',
    function: 'fetchStatRegData',
    message: Events.REQUEST_DATA,
    status: `${response.status}`,
    request: requestParams,
    response,
  })

  if (response.status !== 200) {
    logUserDataQuery(dataKey, {
      file: '/lib/ssb/statreg/common.ts',
      function: 'fetchStatRegData',
      message: Events.REQUEST_GOT_ERROR_RESPONSE,
      status: `${response.status}`,
      response,
    })
  }

  return response
}

export interface StatRegCommonLib {
  fetchStatRegData: (dataKey: string, serviceUrl: string) => HttpResponse
}
