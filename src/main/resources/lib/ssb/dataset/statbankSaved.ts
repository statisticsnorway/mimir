import { DatasetRepoNode, RepoDatasetLib } from '../../repo/dataset'
import { Content } from 'enonic-types/lib/content'
import { DataSource } from '../../../site/mixins/dataSource/dataSource'
import { JSONstat } from '../../types/jsonstat-toolkit'
import { RepoQueryLib } from '../../repo/query'

const {
  getDataset
}: RepoDatasetLib = __non_webpack_require__('/lib/repo/dataset')
const {
  get: fetchData
} = __non_webpack_require__('/lib/statBankSaved/statBankSaved')
const {
  logUserDataQuery,
  Events
}: RepoQueryLib = __non_webpack_require__('/lib/repo/query')
const {
  isUrl
} = __non_webpack_require__('/lib/ssb/utils')

export function getStatbankApi(content: Content<DataSource>): DatasetRepoNode<JSONstat> | null {
  if (content.data.dataSource && content.data.dataSource._selected) {
    const dataSource: DataSource['dataSource'] = content.data.dataSource
    if (dataSource.statbankApi && dataSource.statbankApi.json && dataSource.statbankApi.urlOrId) {
      return getDataset(content.data.dataSource?._selected, content._id)
    }
  }
  return null
}

export function fetchStatbankSavedData(content: Content<DataSource>): object | null {
  if (content.data.dataSource) {
    const format: string = '.html5_table'
    const basePath: string = '/sq/'
    const baseUrl: string = app.config && app.config['ssb.statbankweb.baseUrl'] ? app.config['ssb.statbankweb.baseUrl'] : 'https://www.ssb.no/statbank'
    try {
      const dataSource: DataSource['dataSource'] = content.data.dataSource
      if (dataSource._selected && dataSource.statbankSaved && dataSource.statbankSaved.urlOrId) {
        const url: string = isUrl(dataSource.statbankSaved.urlOrId) ?
          dataSource.statbankSaved.urlOrId :
          `${baseUrl}${basePath}${dataSource.statbankSaved.urlOrId}${format}`
        return fetchData(url, undefined, undefined, content._id)
      }
    } catch (e) {
      const message: string = `Failed to fetch data from statregSaved: ${content._id} (${e})`
      logUserDataQuery(content._id, {
        message: Events.FAILED_TO_REQUEST_DATASET,
        info: message
      })
      log.error(message)
    }
    return null
  } else {
    return null
  }
}

export interface StatbankSavedLib {
  fetchStatbankSavedData: (content: Content<DataSource>) => JSONstat | null;
}
