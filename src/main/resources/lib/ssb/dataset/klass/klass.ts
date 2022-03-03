import { DatasetRepoNode, DataSource as DataSourceType } from '../../repo/dataset'
import { Content } from '/lib/xp/content'
import { DataSource } from '../../../../site/mixins/dataSource/dataSource'

const {
  getDataset
} = __non_webpack_require__('/lib/ssb/repo/dataset')
const {
  get: fetchData
} = __non_webpack_require__('/lib/ssb/dataset/klass/klassRequest')
const {
  logUserDataQuery,
  Events
} = __non_webpack_require__('/lib/ssb/repo/query')
const {
  isUrl
} = __non_webpack_require__('/lib/ssb/utils/utils')

export function getKlass(content: Content<DataSource>, branch: string): DatasetRepoNode<object> | null {
  if (content.data.dataSource && content.data.dataSource._selected === DataSourceType.KLASS) {
    const dataSource: DataSource['dataSource'] = content.data.dataSource
    if (dataSource.klass && dataSource.klass.urlOrId) {
      return getDataset(content.data.dataSource?._selected, branch, content._id)
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
      if (dataSource._selected === DataSourceType.KLASS && dataSource.klass && dataSource.klass.urlOrId) {
        let url: string = `${baseUrl}/v1/classifications/${dataSource.klass.urlOrId}`
        if (isUrl(dataSource.klass.urlOrId)) {
          url = dataSource.klass.urlOrId
        }
        data = fetchData(url, undefined, undefined, content._id)
      }
    } catch (e) {
      const message: string = `Failed to fetch data from klass: ${content._id} (${e})`
      logUserDataQuery(content._id, {
        file: '/lib/ssb/dataset/klass.ts',
        function: 'fetchKlassData',
        message: Events.REQUEST_GOT_ERROR_RESPONSE,
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
  getKlass: (content: Content<DataSource>, branch: string) => DatasetRepoNode<object> | null;
  fetchKlassData: (content: Content<DataSource>) => object | null;
  getKlassKey: (content: Content<DataSource>) => string;
}
