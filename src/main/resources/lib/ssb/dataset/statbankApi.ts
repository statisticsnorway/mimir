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
} = __non_webpack_require__('/lib/dataquery')
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

export function fetchStatbankApiData(content: Content<DataSource>): JSONstat | null {
  const baseUrl: string = app.config && app.config['ssb.pxwebapi.baseUrl'] ? app.config['ssb.pxwebapi.baseUrl'] : 'https://data.ssb.no/api/v0/no'
  let data: JSONstat | null = null
  if (content.data.dataSource) {
    try {
      const dataSource: DataSource['dataSource'] = content.data.dataSource
      if (dataSource._selected && dataSource.statbankApi && dataSource.statbankApi.json) {
        let url: string = `${baseUrl}/table/${dataSource.statbankApi.urlOrId}`
        if (isUrl(dataSource.statbankApi.urlOrId)) {
          url = dataSource.statbankApi.urlOrId as string
        }
        data = fetchData(url, dataSource.statbankApi.json && JSON.parse(dataSource.statbankApi.json), undefined, content._id)
      }
    } catch (e) {
      const message: string = `Failed to fetch data from statregApi: ${content._id} (${e})`
      logUserDataQuery(content._id, {
        message: Events.FAILED_TO_REQUEST_DATASET,
        info: message
      })
      log.error(message)
    }
  }
  return data
}

export function getStatbankApiKey(content: Content<DataSource>): string {
  return content._id
}

export interface StatbankApiLib {
  getStatbankApi: (content: Content<DataSource>) => DatasetRepoNode<JSONstat> | null;
  fetchStatbankApiData: (content: Content<DataSource>) => JSONstat | null;
  getStatbankApiKey: (content: Content<DataSource>) => string;
}
