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
  const dataSource: DataSource['dataSource'] = content.data.dataSource
  if (!dataSource || dataSource._selected !== DataSourceType.STATBANK_SAVED || !dataSource.statbankSaved?.urlOrId) {
    return null
  }

  const urlOrId = dataSource.statbankSaved.urlOrId.trim()

  // Transitional phase: plain numeric ids still use the legacy html5_table endpoint.
  // This can be removed once all saved queries are updated to use the new Statbank URLs.
  if (/^\d+$/.test(urlOrId)) {
    return fetchStatbankSavedDataLegacy(content)
  }

  const savedQueryId = extractSavedQueryId(urlOrId)
  if (!savedQueryId) return null

  const baseUrl = resolveSavedQueryBaseUrl(urlOrId)
  const url = buildSavedQueryHtmlUrl(baseUrl, savedQueryId)

  try {
    return fetchData(url, content._id)
  } catch (e) {
    log.error(`Failed to fetch data from pxweb v2 savedqueries: ${content._id}. ${url}. (${e})`)
    logUserDataQuery(content._id, {
      file: '/lib/ssb/dataset/statbankSaved.ts',
      function: 'fetchStatbankSavedData',
      message: Events.REQUEST_COULD_NOT_CONNECT,
      status: e,
    })
    return null
  }
}

/**
 * Legacy html5_table implementation used during migration to the new saved query format.
 * Remove when all saved queries are migrated to v2.
 */
function fetchStatbankSavedDataLegacy(content: Content<DataSource>): object | null {
  if (content.data.dataSource) {
    const format = '.html5_table'
    const basePath = '/sq/'
    const baseUrl: string =
      app.config && app.config['ssb.statbankweb.oldBaseUrl']
        ? app.config['ssb.statbankweb.oldBaseUrl']
        : 'https://www.ssb.no/statbank1'
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

function extractSavedQueryId(urlOrId: string): string | null {
  urlOrId = urlOrId.trim()

  // Plain numeric id (e.g. "30114755")
  if (/^\d+$/.test(urlOrId)) return urlOrId

  // New Statbank table URL: ...?sq=<id>
  const sq = urlOrId.match(/[?&]sq=(\d+)/)?.[1]
  if (sq) return sq

  // Legacy Statbank URL: /sq/<id>
  const legacy = urlOrId.match(/\/sq\/(\d+)/)?.[1]
  if (legacy) return legacy

  return null
}

function resolveSavedQueryBaseUrl(urlOrId: string): string {
  const pxWebApiBase = app.config?.['ssb.pxwebapi.v2.baseUrl'] ?? 'https://data.ssb.no/api/pxwebapi/v2'
  const host = urlOrId.match(/^https?:\/\/([^/]+)/i)?.[1]
  if (host === 'www.qa.ssb.no') return 'https://data.qa.ssb.no/api/pxwebapi/v2'
  if (host === 'www.ssb.no') return 'https://data.ssb.no/api/pxwebapi/v2'

  return pxWebApiBase
}

function buildSavedQueryHtmlUrl(baseUrl: string, savedQueryId: string): string {
  const b = baseUrl.replace(/\/$/, '')
  return `${b}/savedqueries/${savedQueryId}/data?outputFormat=html`
}
