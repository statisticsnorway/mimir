import { Content } from '/lib/xp/content'
import { DataSource as DataSourceType, DatasetRepoNode, getDataset } from '/lib/ssb/repo/dataset'
import { type JSONstat } from '/lib/types/jsonstat-toolkit'
import { get as fetchData } from '/lib/ssb/utils/datasetUtils'
import { logUserDataQuery, Events } from '/lib/ssb/repo/query'
import { type DataSource } from '/site/mixins/dataSource'

export function getPxApi(content: Content<DataSource>, branch: string): DatasetRepoNode<JSONstat> | null {
  if (content?.data?.dataSource?._selected) {
    const dataSource: DataSource['dataSource'] = content.data.dataSource

    if (dataSource._selected === DataSourceType.PXAPI && dataSource.pxapi && dataSource.pxapi.urlOrId) {
      return getDataset(content.data.dataSource?._selected, branch, content._id)
    }
  }

  logUserDataQuery(content._id, {
    file: '/lib/ssb/dataset/pxapi/pxapi.ts',
    function: 'getPxApi',
    message: Events.DATASOURCE_MISSING,
    info: 'content.data.datasource is undefined.',
  })

  return null
}

export function fetchPxApiData(content: Content<DataSource>) {
  log.info(`PXAPI: fetchPxApiData called for ${content._id}`)

  const baseUrl: string = app?.config?.['ssb.pxapiv2.baseUrl']
    ? app.config['ssb.pxapiv2.baseUrl']
    : 'https://data.ssb.no/api/pxwebapi/v2/tables'

  let data: JSONstat | null = null

  if (content.data.dataSource) {
    try {
      const dataSource: DataSource['dataSource'] = content.data.dataSource

      if (
        dataSource._selected === DataSourceType.PXAPI &&
        dataSource.pxapi &&
        dataSource.pxapi.urlOrId &&
        dataSource.pxapi.json
      ) {
        const language: string = content.language === 'nb' ? 'no' : content.language || 'no'

        const urlOrId: string = dataSource.pxapi.urlOrId.trim()

        let url = `${baseUrl}/${urlOrId}/data?lang=${language}&outputFormat=json-stat2`

        if (urlOrId.includes(baseUrl)) {
          url = urlOrId
        }

        data = fetchData(url, JSON.parse(dataSource.pxapi.json), undefined, content._id) as JSONstat
      }
    } catch (e) {
      const message = `Failed to fetch data from pxApi: ${content._id} (${e})`

      logUserDataQuery(content._id, {
        file: '/lib/ssb/dataset/pxapi/pxapi.ts',
        function: 'fetchPxApiData',
        message: Events.REQUEST_COULD_NOT_CONNECT,
        info: message,
        status: e,
      })

      log.error(message)
    }
  }

  return data
}

export function getPxApiKey(content: Content<DataSource>): string {
  return content._id
}
