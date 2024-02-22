import { Content } from '/lib/xp/content'
import { DatasetRepoNode, DataSource as DataSourceType, getDataset } from '/lib/ssb/repo/dataset'
import { get as fetchData } from '/lib/ssb/utils/datasetUtils'

import { logUserDataQuery, Events } from '/lib/ssb/repo/query'
import { isUrl } from '/lib/ssb/utils/utils'
import { type DataSource } from '/site/mixins/dataSource'

export function getKlass(content: Content<DataSource>, branch: string): DatasetRepoNode<object> | null {
  if (content.data.dataSource && content.data.dataSource._selected === DataSourceType.KLASS) {
    const dataSource: DataSource['dataSource'] = content.data.dataSource
    if (dataSource?.klass?.urlOrId) {
      return getDataset(content.data.dataSource?._selected, branch, content._id)
    }
  }
  return null
}

export function fetchKlassData(content: Content<DataSource>) {
  const baseUrl: string = app?.config?.['ssb.klassapi.baseUrl']
    ? app.config['ssb.klassapi.baseUrl']
    : 'https://data.ssb.no/api/klass'
  let data: object | null = null
  if (content.data.dataSource) {
    try {
      const dataSource: DataSource['dataSource'] = content.data.dataSource
      if (dataSource._selected === DataSourceType.KLASS && dataSource.klass && dataSource.klass.urlOrId) {
        let url = `${baseUrl}/v1/classifications/${dataSource.klass.urlOrId}`
        if (isUrl(dataSource.klass.urlOrId)) {
          url = dataSource.klass.urlOrId
        }
        data = fetchData(url, undefined, undefined, content._id)
      }
    } catch (e) {
      const message = `Failed to fetch data from klass: ${content._id} (${e})`
      logUserDataQuery(content._id, {
        file: '/lib/ssb/dataset/klass.ts',
        function: 'fetchKlassData',
        message: Events.REQUEST_GOT_ERROR_RESPONSE,
        info: message,
      })
      log.error(message)
    }
  }
  return data
}

export function getKlassKey(content: Content<DataSource>): string {
  return content._id
}
