import { Content } from '/lib/xp/content'
import { DatasetRepoNode, DataSource as DataSourceType, getDataset } from '/lib/ssb/repo/dataset'
import { type JSONstat } from '/lib/types/jsonstat-toolkit'
import { get as fetchData } from '/lib/ssb/dataset/statbankSaved/statbankSavedRequest'
import { logUserDataQuery, Events } from '/lib/ssb/repo/query'
import { type DataSource } from '/site/mixins/dataSource'

export function getStatbankSaved(content: Content<DataSource>, branch: string): DatasetRepoNode<JSONstat> | null {
  const dataSource: DataSource['dataSource'] | undefined = content.data.dataSource
  if (dataSource?._selected !== DataSourceType.STATBANK_SAVED) return null
  if (!dataSource.statbankSaved?.urlOrId?.trim()) return null

  return getDataset(DataSourceType.STATBANK_SAVED, branch, content._id)
}

export function fetchStatbankSavedData(content: Content<DataSource>): object | null {
  const dataSource: DataSource['dataSource'] | undefined = content.data.dataSource
  if (dataSource?._selected !== DataSourceType.STATBANK_SAVED) return null
  const urlOrId = dataSource.statbankSaved?.urlOrId?.trim()
  if (!urlOrId) return null

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
      status: e instanceof Error ? e.message : String(e),
    })
    return null
  }
}

function extractSavedQueryId(urlOrId: string): string | null {
  const value = urlOrId.trim()

  // Plain numeric id (e.g. "30114755")
  if (/^\d+$/.test(value)) return value

  // New Statbank table URL: ...?sq=<id>
  const sqMatch = /[?&]sq=(\d+)/.exec(value)
  if (sqMatch) return sqMatch[1]

  // Legacy Statbank URL: /sq/<id>
  const legacyMatch = /\/sq\/(\d+)/.exec(value)
  if (legacyMatch) return legacyMatch[1]

  return null
}

function resolveSavedQueryBaseUrl(urlOrId: string): string {
  const pxWebApiBase = app.config?.['ssb.pxwebapi.v2.baseUrl'] ?? 'https://data.ssb.no/api/pxwebapi/v2'
  const hostMatch = /^https?:\/\/([^/]+)/i.exec(urlOrId)
  const host = hostMatch?.[1]?.toLowerCase()

  if (host === 'www.qa.ssb.no') return 'https://data.qa.ssb.no/api/pxwebapi/v2'
  if (host === 'www.ssb.no') return 'https://data.ssb.no/api/pxwebapi/v2'

  return pxWebApiBase
}

function buildSavedQueryHtmlUrl(baseUrl: string, savedQueryId: string): string {
  const b = baseUrl.replace(/\/$/, '')
  return `${b}/savedqueries/${savedQueryId}/data?outputFormat=html`
}
