import { Content } from '/lib/xp/content'
import { DatasetRepoNode, DataSource as DataSourceType, getDataset } from '/lib/ssb/repo/dataset'
import { type JSONstat } from '/lib/types/jsonstat-toolkit'
import { get as fetchData, type StatbankPostBody } from '/lib/ssb/utils/datasetUtils'

import { logUserDataQuery, Events } from '/lib/ssb/repo/query'
import { isUrl } from '/lib/ssb/utils/utils'
import { type DataSource } from '/site/mixins/dataSource'

export function getStatbankApi(content: Content<DataSource>, branch: string): DatasetRepoNode<JSONstat> | null {
  if (content?.data?.dataSource?._selected) {
    const dataSource: DataSource['dataSource'] = content.data.dataSource
    if (
      dataSource._selected === DataSourceType.STATBANK_API &&
      dataSource.statbankApi &&
      dataSource.statbankApi.json &&
      dataSource.statbankApi.urlOrId
    ) {
      return getDataset(content.data.dataSource?._selected, branch, content._id)
    }
  }
  logUserDataQuery(content._id, {
    file: '/lib/ssb/dataset/statbankApi/statbankApi.ts',
    function: 'getStatbankApi',
    message: Events.DATASOURCE_MISSING,
    info: 'content.data.datasource is undefined.',
  })
  return null
}

export function fetchStatbankApiDataOld(content: Content<DataSource>) {
  const baseUrl: string = app?.config?.['ssb.pxwebapi.baseUrl']
    ? app.config['ssb.pxwebapi.baseUrl']
    : 'https://data.ssb.no/api/v0/no'
  let data: object | JSONstat | null = null
  if (content.data.dataSource) {
    try {
      const dataSource: DataSource['dataSource'] = content.data.dataSource
      if (
        dataSource._selected === DataSourceType.STATBANK_API &&
        dataSource.statbankApi &&
        dataSource.statbankApi.json
      ) {
        let url = `${baseUrl}/table/${dataSource.statbankApi.urlOrId}`
        if (isUrl(dataSource.statbankApi.urlOrId)) {
          url = dataSource.statbankApi.urlOrId as string
        }
        data = fetchData(
          url,
          dataSource.statbankApi.json && JSON.parse(dataSource.statbankApi.json),
          undefined,
          content._id
        )
      }
    } catch (e) {
      const message = `Failed to fetch data from statregApi: ${content._id} (${e})`
      logUserDataQuery(content._id, {
        file: '/lib/ssb/dataset/statbankApi/statbankApi.ts',
        function: 'fetchStatbankApiData',
        message: Events.REQUEST_COULD_NOT_CONNECT,
        info: message,
        status: e,
      })
      log.error(message)
    }
  }
  return data
}

export function fetchStatbankApiData(content: Content<DataSource>) {
  const baseUrlV1 = app?.config?.['ssb.pxwebapi.baseUrl'] ?? 'https://data.ssb.no/api/v0/no'
  const baseUrlV2 = app?.config?.['ssb.pxwebapi.v2.baseUrl'] ?? 'https://data.ssb.no/api/pxwebapi/v2'

  const dataSource = content.data.dataSource
  if (!dataSource) return null
  if (dataSource._selected !== DataSourceType.STATBANK_API) return null

  const statbankApi = dataSource.statbankApi
  if (!statbankApi) return null

  const { urlOrId, json } = statbankApi
  if (!urlOrId) {
    log.error(`Missing urlOrId for statbankApi datasource (${content._id})`)
    return null
  }

  try {
    const body: StatbankPostBody | undefined = json ? (JSON.parse(json) as StatbankPostBody) : undefined
    const url = buildStatbankApiUrl(urlOrId, body, baseUrlV1, baseUrlV2)

    return fetchData(url, body, undefined, content._id)
  } catch (e) {
    const message = `Failed to fetch data from statbankApi: ${content._id} (${e})`

    logUserDataQuery(content._id, {
      file: '/lib/ssb/dataset/statbankApi/statbankApi.ts',
      function: 'fetchStatbankApiData',
      message: Events.REQUEST_COULD_NOT_CONNECT,
      info: message,
      status: e,
    })

    log.error(message)
    return null
  }
}

export function fetchStatbankApiDataQuery(urlOrId: string, jsonQuery: string) {
  const baseUrl: string = app?.config?.['ssb.pxwebapi.baseUrl']
    ? app.config['ssb.pxwebapi.baseUrl']
    : 'https://data.ssb.no/api/v0/no'
  let data: object | JSONstat | null = null
  try {
    let url = `${baseUrl}/table/${urlOrId}`
    if (isUrl(urlOrId)) {
      url = urlOrId as string
    }
    data = fetchData(url, jsonQuery && JSON.parse(jsonQuery), undefined, undefined, true)
  } catch (e) {
    const message = `Failed to fetch data from statbankApi: ${urlOrId} (${e})`
    log.error(message)
  }
  return data
}

export function getStatbankApiKey(content: Content<DataSource>): string {
  return content._id
}

export function getTableIdFromStatbankApi(content: Content<DataSource>): string | undefined {
  if (
    content.data.dataSource?._selected === DataSourceType.STATBANK_API &&
    content.data.dataSource?.statbankApi?.urlOrId
  ) {
    return content.data.dataSource?.statbankApi?.urlOrId.split('?').shift()?.replace(/\/$/, '').split('/').pop()
  }
  return
}

function buildStatbankApiUrl(
  urlOrId: string,
  body: StatbankPostBody | undefined,
  baseUrlV1: string,
  baseUrlV2: string
): string {
  if (isUrl(urlOrId)) return urlOrId

  if (body && 'selection' in body) {
    return `${baseUrlV2}/tables/${urlOrId}/data?lang=no`
  }

  return `${baseUrlV1}/table/${urlOrId}`
}
