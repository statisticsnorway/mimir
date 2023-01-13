import { request, HttpRequestParams, HttpResponse } from '/lib/http-client'
import {
  TbmlDataRaw,
  TableRowRaw,
  TableCellRaw,
  TbmlDataUniform,
  TableRowUniform,
  TableCellUniform,
  MetadataUniform,
  TbmlSourceListRaw,
  TbmlSourceListUniform,
  XmlParser,
  MetadataRaw,
  Title,
  Note,
} from '/lib/types/xmlParser'

const xmlParser: XmlParser = __.newBean('no.ssb.xp.xmlparser.XmlParser')
const { logUserDataQuery, Events } = __non_webpack_require__('/lib/ssb/repo/query')
const { getTbmlMock } = __non_webpack_require__('/lib/ssb/dataset/tbprocessor/tbmlMock')
const {
  data: { forceArray },
} = __non_webpack_require__('/lib/util')

export enum TbProcessorTypes {
  DATA_SET = 'DATA_SET',
  SOURCE_LIST = 'SOURCE_LIST',
}

export function getTbmlData<T extends TbmlDataUniform | TbmlSourceListUniform>(
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
    parsedBody: response.body && response.status === 200 ? processBody<T>(response.body, queryId) : undefined,
  }
}

function processBody<T extends TbmlDataUniform | TbmlSourceListUniform>(
  body: string,
  queryId?: string
): TbmlDataUniform | TbmlSourceListUniform {
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
    readTimeout: 40000,
  }
  const response: HttpResponse = mock ? mock : request(requestParams)

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
        source: tbmlSourceList.sourceList.tbml.source ? forceArray(tbmlSourceList.sourceList.tbml.source) : [],
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
  return forceArray(thead).map((thead) => ({
    tr: getTableCellHeader(forceArray(thead.tr)),
  }))
}

function getTableBody(tbody: TableRowRaw | Array<TableRowRaw>): Array<TableRowUniform> {
  return forceArray(tbody).map((tbody) => ({
    tr: getTableCellBody(forceArray(tbody.tr)),
  }))
}

function getTableCellHeader(tableCell: Array<TableCellRaw>): Array<TableCellUniform> {
  return forceArray(tableCell).map((cell) => ({
    td: typeof cell.td != 'undefined' ? forceArray(cell.td) : [],
    th: typeof cell.th != 'undefined' ? forceArray(cell.th) : [],
  }))
}

function getTableCellBody(tableCell: Array<TableCellRaw>): Array<TableCellUniform> {
  return forceArray(tableCell).map((cell) => ({
    th: typeof cell.th != 'undefined' ? forceArray(cell.th) : [],
    td: typeof cell.td != 'undefined' ? forceArray(cell.td) : [],
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
  const notes: Array<Note> = metadataRaw.notes ? forceArray(metadataRaw.notes.note) : []

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

export interface TbmlLib {
  getTbmlData: <T extends TbmlDataUniform | TbmlSourceListUniform>(
    url: string,
    queryId?: string,
    processXml?: string,
    type?: string
  ) => TbprocessorParsedResponse<T>
  TbProcessorTypes: typeof TbProcessorTypes
}

export interface TbprocessorParsedResponse<T extends TbmlDataUniform | TbmlSourceListUniform> {
  body: string | null
  status: number
  parsedBody?: T
}

export interface Authorization {
  Authorization: string
}
