import { sleep } from '/lib/xp/task'
import { request, HttpRequestParams, HttpResponse } from '/lib/http-client'
import {
  type TbmlDataRaw,
  type TableRowRaw,
  type TableCellRaw,
  type TbmlDataUniform,
  type TableRowUniform,
  type TableCellUniform,
  type MetadataUniform,
  type TbmlSourceListRaw,
  type TbmlSourceListUniform,
  type XmlParser,
  type MetadataRaw,
  type Title,
  type Note,
} from '/lib/types/xmlParser'

const xmlParser: XmlParser = __.newBean('no.ssb.xp.xmlparser.XmlParser')
import { logUserDataQuery, Events } from '/lib/ssb/repo/query'
import { getTbmlMock } from '/lib/ssb/dataset/tbprocessor/tbmlMock'
import * as util from '/lib/util'

export enum TbProcessorTypes {
  DATA_SET = 'DATA_SET',
  SOURCE_LIST = 'SOURCE_LIST',
}

export function getTbmlData(
  url: string,
  queryId?: string,
  processXml?: string,
  type?: string
): TbprocessorParsedResponse<TbmlDataUniform | TbmlSourceListUniform> {
  //
  const response: HttpResponse = fetch(url, queryId, processXml, type)
  return {
    body: response.body,
    status: response.status,
    parsedBody: response.body && response.status === 200 ? processBody(response.body, queryId) : undefined,
  }
}

function processBody(body: string, queryId?: string): TbmlDataUniform | TbmlSourceListUniform {
  //
  const tbmlDataRaw: TbmlDataRaw | TbmlSourceListRaw = xmlToJson(body, queryId)
  if ((tbmlDataRaw as TbmlSourceListRaw).sourceList) {
    return getTbmlSourceListUniform(tbmlDataRaw as TbmlSourceListRaw)
  } else {
    return getTbmlDataUniform(tbmlDataRaw as TbmlDataRaw)
  }
}

export function fetch(url: string, queryId?: string, processXml?: string, type?: string): HttpResponse {
  const mock: HttpResponse | null = getTbmlMock(url)
  const requestParams: HttpRequestParams = {
    url,
    body: processXml,
    method: processXml ? 'POST' : 'GET',
    connectionTimeout: 60000,
    readTimeout: 40000,
  }
  let attempt = 0
  const maxRetries = 3
  while (attempt <= maxRetries) {
    try {
      const response = mock ? mock : request(requestParams)

      if (queryId) {
        logUserDataQuery(queryId, {
          file: '/lib/tbml/tbml.ts',
          function: 'fetch',
          message: type ? getRequestType(type) : Events.REQUEST_DATA,
          status: `${response.status}`,
          request: requestParams,
          response,
        })
      }

      if (response.status !== 200 && response.body) {
        if (queryId) {
          logUserDataQuery(queryId, {
            file: '/lib/tbml/tbml.ts',
            function: 'fetch',
            message: Events.REQUEST_GOT_ERROR_RESPONSE,
            status: `${response.status}`,
            response,
          })
        }
        const message = `Failed with status ${response.status} while fetching tbml data from ${url}`
        log.error(message)
      }

      return response
    } catch (e) {
      if (attempt < maxRetries) {
        attempt++
        log.warning(
          `Attempt ${attempt} failed from tbprocessor${url ? ` (${url})` : ''} with queryId: ${queryId}. Retrying...`
        )
        sleep(250)
      } else {
        log.error(e)
        throw e
      }
    }
  }
}

function getRequestType(type: string): string {
  switch (type) {
    case TbProcessorTypes.DATA_SET:
      return Events.REQUEST_DATASET
    case TbProcessorTypes.SOURCE_LIST:
      return Events.REQUEST_SOURCELIST
    default:
      return Events.REQUEST_DATA
  }
}

function getTbmlSourceListUniform(tbmlSourceList: TbmlSourceListRaw): TbmlSourceListUniform {
  return {
    sourceList: {
      tbml: {
        id: tbmlSourceList.sourceList.tbml.id,
        source: tbmlSourceList.sourceList.tbml.source
          ? util.data.forceArray(tbmlSourceList.sourceList.tbml.source)
          : [],
      },
    },
  }
}

function getTbmlDataUniform(tbmlDataRaw: TbmlDataRaw): TbmlDataUniform {
  const tableHead: Array<TableRowUniform> = getTableHead(tbmlDataRaw.tbml.presentation.table.thead)
  const tableBody: Array<TableRowUniform> = getTableBody(tbmlDataRaw.tbml.presentation.table.tbody)
  const metadataUniform: MetadataUniform = getMetadataDataUniform(tbmlDataRaw.tbml.metadata)

  return {
    tbml: {
      presentation: {
        table: {
          thead: tableHead,
          tbody: tableBody,
          class: tbmlDataRaw.tbml.presentation.table.class,
        },
      },
      metadata: metadataUniform,
    },
  }
}

function getTableHead(thead: TableRowRaw | Array<TableRowRaw>): Array<TableRowUniform> {
  return util.data.forceArray(thead).map((thead) => ({
    tr: getTableCellHeader(util.data.forceArray(thead.tr)),
  }))
}

function getTableBody(tbody: TableRowRaw | Array<TableRowRaw>): Array<TableRowUniform> {
  return util.data.forceArray(tbody).map((tbody) => ({
    tr: getTableCellBody(util.data.forceArray(tbody.tr)),
  }))
}

function getTableCellHeader(tableCell: Array<TableCellRaw>): Array<TableCellUniform> {
  return util.data.forceArray(tableCell).map((cell) => ({
    td: typeof cell.td != 'undefined' ? util.data.forceArray(cell.td) : [],
    th: typeof cell.th != 'undefined' ? util.data.forceArray(cell.th) : [],
  }))
}

function getTableCellBody(tableCell: Array<TableCellRaw>): Array<TableCellUniform> {
  return util.data.forceArray(tableCell).map((cell) => ({
    th: typeof cell.th != 'undefined' ? util.data.forceArray(cell.th) : [],
    td: typeof cell.td != 'undefined' ? util.data.forceArray(cell.td) : [],
  }))
}

function getMetadataDataUniform(metadataRaw: MetadataRaw): MetadataUniform {
  const title: Title =
    typeof metadataRaw.title == 'string'
      ? {
          noterefs: '',
          content: metadataRaw.title,
        }
      : metadataRaw.title

  const publicRelatedTableIds: string | number | undefined = metadataRaw.instance.publicRelatedTableIds
  const relatedTableIds: string = metadataRaw.instance.relatedTableIds
  const notes: Array<Note> = metadataRaw.notes ? util.data.forceArray(metadataRaw.notes.note) : []

  return {
    instance: {
      publicRelatedTableIds: publicRelatedTableIds ? publicRelatedTableIds.toString().split(' ') : [],
      language: metadataRaw.instance['xml:lang'],
      relatedTableIds: relatedTableIds ? relatedTableIds.toString().split(' ') : [],
      definitionId: metadataRaw.instance.definitionId,
    },
    tablesource: metadataRaw.tablesource,
    title: title,
    category: metadataRaw.category,
    shortnameweb: metadataRaw.shortnameweb,
    tags: metadataRaw.tags,
    notes: {
      note: notes,
    },
  }
}

function xmlToJson<T>(xml: string, queryId?: string): T {
  try {
    const json: string = xmlParser.parse(xml)
    return JSON.parse(json)
  } catch (e) {
    if (queryId) {
      logUserDataQuery(queryId, {
        function: 'xmlToJson',
        file: '/lib/tbml/tbml.ts',
        info: e,
        message: Events.XML_TO_JSON,
      })
    }
    throw new Error(`Failed while parsing tbml data: ${e}`)
  }
}

export interface TbprocessorParsedResponse<T extends TbmlDataUniform | TbmlSourceListUniform> {
  body: string | null
  status: number
  parsedBody?: T
}

export interface Authorization {
  Authorization: string
}
