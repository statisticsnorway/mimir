import { HttpLibrary, HttpResponse } from 'enonic-types/http'
import { Events } from '../../repo/query'
import { StatRegFetchResult } from '../../repo/statreg'
import { Contact, Publication, StatisticInListing } from './types'
const http: HttpLibrary = __non_webpack_require__('/lib/http-client')

export function fetchStatRegData(
  dataKey: string,
  serviceUrl: string,
  extractor: (payload: string) => Array<Contact> | Array<Publication> | Array<StatisticInListing>): StatRegFetchResult {
  const result: HttpResponse = http.request({
    url: serviceUrl,
    method: 'GET',
    contentType: 'application/json',
    headers: {
      'Cache-Control': 'no-cache',
      'Accept': 'application/json'
    },
    connectionTimeout: 30000,
    readTimeout: 30000
  })

  if ((result.status === 200) && result.body) {
    const data: Array<Contact> | Array<Publication> | Array<StatisticInListing> = extractor(result.body)
    log.info(`Fetched ${data ? data.length : 0} ${dataKey}`)
    return {
      content: data,
      status: Events.GET_DATA_COMPLETE
    }
  } else {
    log.error(`HTTP ${serviceUrl} (${result.status} ${result.message}`)
    return {
      content: null,
      status: Events.FAILED_TO_GET_DATA
    }
  }
}

export interface StatRegCommonLib {
  fetchStatRegData: (
    dataKey: string,
    serviceUrl: string,
    extractor: (payload: string) => Array<Contact> | Array<Publication> | Array<StatisticInListing>) => StatRegFetchResult;
}
