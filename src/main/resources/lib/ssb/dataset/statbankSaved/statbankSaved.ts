import { DatasetRepoNode, DataSource as DataSourceType } from '../../repo/dataset'
import { Content } from '/lib/xp/content'
import { DataSource } from '../../../../site/mixins/dataSource/dataSource'
import { JSONstat } from '../../../types/jsonstat-toolkit'
import { StatbankSavedRaw } from '../../../types/xmlParser'

const { getDataset } = __non_webpack_require__('/lib/ssb/repo/dataset')
const { get: fetchData } = __non_webpack_require__('/lib/ssb/dataset/statbankSaved/statbankSavedRequest')
const { logUserDataQuery, Events } = __non_webpack_require__('/lib/ssb/repo/query')
const { isUrl } = __non_webpack_require__('/lib/ssb/utils/utils')

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

export interface StatbankSavedLib {
  getStatbankSaved(content: Content<DataSource>, branch: string): DatasetRepoNode<JSONstat> | null
  fetchStatbankSavedData: (content: Content<DataSource>) => StatbankSavedRaw | null
}
