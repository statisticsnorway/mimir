import { DatasetRepoNode, DataSource as DataSourceType } from '../../repo/dataset'
import { Content } from '/lib/xp/content'
import type { DataSource } from '../../../../site/mixins/dataSource'
import { JSONstat } from '../../../types/jsonstat-toolkit'

const { getDataset } = __non_webpack_require__('/lib/ssb/repo/dataset')
const { get: fetchData } = __non_webpack_require__('/lib/ssb/dataset/statbankApi/statbankApiRequest')
const { logUserDataQuery, Events } = __non_webpack_require__('/lib/ssb/repo/query')
const { isUrl } = __non_webpack_require__('/lib/ssb/utils/utils')

export function getStatbankApi(content: Content<DataSource>, branch: string): DatasetRepoNode<JSONstat> | null {
  if (content.data.dataSource && content.data.dataSource._selected) {
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

export function fetchStatbankApiData(content: Content<DataSource>): JSONstat | null {
  const baseUrl: string =
    app.config && app.config['ssb.pxwebapi.baseUrl']
      ? app.config['ssb.pxwebapi.baseUrl']
      : 'https://data.ssb.no/api/v0/no'
  let data: JSONstat | null = null
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

export interface StatbankApiLib {
  getStatbankApi: (content: Content<DataSource>, branch: string) => DatasetRepoNode<JSONstat> | null
  fetchStatbankApiData: (content: Content<DataSource>) => JSONstat | null
  getStatbankApiKey: (content: Content<DataSource>) => string
  getTableIdFromStatbankApi: (content: Content<DataSource>) => string | undefined
}
