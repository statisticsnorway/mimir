import { DatasetRepoNode, RepoDatasetLib } from '../../repo/dataset'
import { Content } from 'enonic-types/lib/content'
import { DataSource } from '../../../site/mixins/dataSource/dataSource'
import { RepoQueryLib } from '../../repo/query'
import { TbmlData } from '../../types/xmlParser'
import { TbmlLib } from '../../tbml/tbml'

const {
  getDataset
}: RepoDatasetLib = __non_webpack_require__('/lib/repo/dataset')
const {
  getTbmlData
}: TbmlLib = __non_webpack_require__('/lib/tbml/tbml')
const {
  logUserDataQuery,
  Events
}: RepoQueryLib = __non_webpack_require__('/lib/repo/query')

export function getTbprocessor(content: Content<DataSource>): DatasetRepoNode<TbmlData> | null {
  if (content.data.dataSource && content.data.dataSource._selected) {
    const dataSource: DataSource['dataSource'] = content.data.dataSource
    if (dataSource.tbprocessor && dataSource.tbprocessor.urlOrId) {
      return getDataset(content.data.dataSource?._selected, getTbprocessorKey(content))
    }
  }
  return null
}

export function fetchTbprocessorData(content: Content<DataSource>): TbmlData | null {
  const baseUrl: string = app.config && app.config['ssb.tbprocessor.baseUrl'] ? app.config['ssb.tbprocessor.baseUrl'] : 'https://i.ssb.no/tbprocessor'
  let data: TbmlData | null = null
  if (content.data.dataSource) {
    try {
      const dataSource: DataSource['dataSource'] = content.data.dataSource
      if (dataSource._selected && dataSource.tbprocessor && dataSource.tbprocessor.urlOrId) {
        data = getTbmlData(`${baseUrl}/process/tbmldata/${getTbprocessorKey(content)}`, content._id)
      }
    } catch (e) {
      const message: string = `Failed to fetch data from tbprocessor: ${content._id} (${e})`
      logUserDataQuery(content._id, {
        message: Events.FAILED_TO_REQUEST_DATASET,
        info: message
      })
      log.error(message)
    }
  }
  return data
}

export function getTbprocessorKey(content: Content<DataSource>): string {
  if (content.data.dataSource && content.data.dataSource.tbprocessor && content.data.dataSource.tbprocessor.urlOrId) {
    let key: string = content.data.dataSource.tbprocessor.urlOrId
    if (key.indexOf('http') > 0) {
      key = key.replace(/\/$/, '')
      const split: Array<string> = key.split('/')
      key = split[split.length - 1]
    }
    return key
  }
  return content._id // fallback, should never find anything
}

export interface TbprocessorLib {
  getTbprocessor: (content: Content<DataSource>) => DatasetRepoNode<TbmlData> | null;
  fetchTbprocessorData: (content: Content<DataSource>) => TbmlData | null;
  getTbprocessorKey: (content: Content<DataSource>) => string;
}
