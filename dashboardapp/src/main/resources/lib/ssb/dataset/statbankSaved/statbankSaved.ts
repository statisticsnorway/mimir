import { Content } from '/lib/xp/content'
import { DatasetRepoNode, DataSource as DataSourceType, getDataset } from '/lib/ssb/repo/dataset'
import { type JSONstat } from '/lib/types/jsonstat-toolkit'
import { get as fetchData } from '/lib/ssb/dataset/statbankSaved/statbankSavedRequest'
import { logUserDataQuery, Events } from '/lib/ssb/repo/query'
import { isUrl } from '/lib/ssb/utils/utils'
import { type DataSource } from '/site/mixins/dataSource'

export function getStatbankSaved(content: Content<DataSource>, branch: string): DatasetRepoNode<JSONstat> | null {
  if (content.data.dataSource && content.data.dataSource._selected === DataSourceType.STATBANK_SAVED) {
    const dataSource: DataSource['dataSource'] = content.data.dataSource
    if (dataSource.statbankSaved && dataSource.statbankSaved.urlOrId) {
      return getDataset(content.data.dataSource?._selected, branch, content._id)
    }
  }
  return null
}

export function fetchStatbankSavedData(content: Content<DataSource>): object | null {
  if (content.data.dataSource) {
    const format = '.html5_table'
    const basePath = '/sq/'
    const baseUrl: string =
      app.config && app.config['ssb.statbankweb.baseUrl']
        ? app.config['ssb.statbankweb.baseUrl']
        : 'https://www.ssb.no/statbank'
    const dataSource: DataSource['dataSource'] = content.data.dataSource
    let url: string | null = null
    if (
      dataSource._selected === DataSourceType.STATBANK_SAVED &&
      dataSource.statbankSaved &&
      dataSource.statbankSaved.urlOrId
    ) {
      url = isUrl(dataSource.statbankSaved.urlOrId)
        ? `${dataSource.statbankSaved.urlOrId}${format}`
        : `${baseUrl}${basePath}${dataSource.statbankSaved.urlOrId}${format}`
    }
    try {
      if (url) {
        return fetchData(url)
      }
    } catch (e) {
      log.error(`Failed to fetch data from statbankweb: ${content._id}. ${url}. (${e})`)
      logUserDataQuery(content._id, {
        file: '/lib/ssb/dataset/statbankSaved.ts',
        function: 'fetchStatbankSavedData',
        message: Events.REQUEST_COULD_NOT_CONNECT,
        status: e,
      })
    }
    return null
  } else {
    return null
  }
}
