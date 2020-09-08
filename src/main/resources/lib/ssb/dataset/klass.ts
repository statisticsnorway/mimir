import { DatasetRepoNode, RepoDatasetLib } from '../../repo/dataset'
import { Content } from 'enonic-types/lib/content'
import { DataSource } from '../../../site/mixins/dataSource/dataSource'
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

export function getKlass(content: Content<DataSource>): DatasetRepoNode<object> | null {
  if (content.data.dataSource && content.data.dataSource._selected) {
    const dataSource: DataSource['dataSource'] = content.data.dataSource
    if (dataSource.klass && dataSource.klass && dataSource.klass.urlOrId) {
      return getDataset(content.data.dataSource?._selected, content._id)
    }
  }
  return null
}

export function fetchKlassData(content: Content<DataSource>): object | null {
  const baseUrl: string = app.config && app.config['ssb.klassapi.baseUrl'] ? app.config['ssb.klassapi.baseUrl'] : 'https://data.ssb.no/api/klass'
  let data: object | null = null
  if (content.data.dataSource) {
    try {
      const dataSource: DataSource['dataSource'] = content.data.dataSource
      if (dataSource._selected && dataSource.klass && dataSource.klass.urlOrId) {
        let url: string = `${baseUrl}/v1/classifications/${dataSource.klass.urlOrId}`
        if (isUrl(dataSource.klass.urlOrId)) {
          url = dataSource.klass.urlOrId
        }
        data = fetchData(url, null, undefined, content._id)
      }
    } catch (e) {
      const message: string = `Failed to fetch data from klass: ${content._id} (${e})`
      logUserDataQuery(content._id, {
        message: Events.FAILED_TO_REQUEST_DATASET,
        info: message
      })
      log.error(message)
    }
  }
  return data
}

export function getKlassKey(content: Content<DataSource>): string {
  return content._id
}

export interface KlassLib {
  getKlass: (content: Content<DataSource>) => DatasetRepoNode<object> | null;
  fetchKlassData: (content: Content<DataSource>) => object | null;
  getKlassKey: (content: Content<DataSource>) => string;
}
