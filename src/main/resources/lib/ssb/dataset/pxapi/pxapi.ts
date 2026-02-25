import { Content } from '/lib/xp/content'
import { DataSource as DataSourceType, DatasetRepoNode, getDataset } from '/lib/ssb/repo/dataset'
import { get as fetchData } from '/lib/ssb/utils/datasetUtils'
import { logUserDataQuery, Events } from '/lib/ssb/repo/query'
import { type DataSource } from '/site/mixins/dataSource'

export interface PxApiCategory {
  index: string[]
  label: Record<string, string>
}

export interface PxApiDimensionEntry {
  category: PxApiCategory
}

export interface PxApiDimensions {
  id: string[]
  size: number[]
}

export interface PxApiDataset {
  class: 'dataset'
  dimension: PxApiDimensions & Record<string, PxApiDimensionEntry>
  value: number[]
}

export function getPxApi(content: Content<DataSource>, branch: string): DatasetRepoNode<PxApiDataset> | null {
  if (content?.data?.dataSource?._selected) {
    const dataSource: DataSource['dataSource'] = content.data.dataSource

    if (dataSource._selected === DataSourceType.PXAPI && dataSource.pxapi && dataSource.pxapi.urlOrId) {
      return getDataset(dataSource._selected, branch, content._id)
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

export function fetchPxApiData(content: Content<DataSource>): PxApiDataset | null {
  const baseUrl: string = app?.config?.['ssb.pxapiv2.baseUrl'] ?? 'https://data.ssb.no/api/pxwebapi/v2/tables'

  try {
    const dataSource: DataSource['dataSource'] = content.data.dataSource

    if (dataSource?._selected === DataSourceType.PXAPI && dataSource.pxapi?.urlOrId && dataSource.pxapi?.json) {
      const language = content.language === 'nb' ? 'no' : content.language || 'no'

      const urlOrId = dataSource.pxapi.urlOrId.trim()

      let url = `${baseUrl}/${urlOrId}/data?lang=${language}&outputFormat=json-stat2`

      if (urlOrId.startsWith('http')) {
        try {
          const parsed = new URL(urlOrId)

          const allowedHost = new URL(baseUrl).host

          if (parsed.host === allowedHost) {
            url = urlOrId
          } else {
            throw new Error(`Invalid PXAPI host: ${parsed.host}`)
          }
        } catch {
          throw new Error('Invalid PXAPI URL')
        }
      }

      return fetchData(url, JSON.parse(dataSource.pxapi.json), undefined, content._id) as PxApiDataset
    }
  } catch (e) {
    logUserDataQuery(content._id, {
      file: '/lib/ssb/dataset/pxapi/pxapi.ts',
      function: 'fetchPxApiData',
      message: Events.REQUEST_COULD_NOT_CONNECT,
      info: `Failed to fetch data from pxApi: ${content._id} (${e})`,
      status: e,
    })

    log.error(`PXAPI fetch failed: ${content._id} (${e})`)
  }

  return null
}

export function getPxApiKey(content: Content<DataSource>): string {
  return content._id
}
