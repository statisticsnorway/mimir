import { Content } from '/lib/xp/content'
import { DatasetRepoNode, DataSource as DataSourceType, getDataset } from '/lib/ssb/repo/dataset'
import { JSONstat } from '/lib/types/jsonstat-toolkit'
import { get as fetchData } from '/lib/ssb/utils/datasetUtils'

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

export function fetchStatbankApiData(content: Content<DataSource>) {
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
    data = fetchData(url, jsonQuery && JSON.parse(jsonQuery), undefined)
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
