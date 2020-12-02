import { HttpLibrary, HttpRequestParams, HttpResponse } from 'enonic-types/http'
import { TbmlData,
  TbmlDataRaw,
  TableRowRaw,
  TableCellRaw,
  TbmlDataUniform,
  TableRowUniform,
  TableCellUniform,
  MetadataUniform,
  TbmlSourceList,
  XmlParser,
  MetadataRaw,
  Title,
  Note } from '../types/xmlParser'
import { RepoQueryLib } from '../repo/query'

const xmlParser: XmlParser = __.newBean('no.ssb.xp.xmlparser.XmlParser')
const http: HttpLibrary = __non_webpack_require__( '/lib/http-client')
const {
  logUserDataQuery,
  Events
}: RepoQueryLib = __non_webpack_require__('/lib/repo/query')

const {
  data: {
    forceArray
  }
} = __non_webpack_require__( '/lib/util')

export function fetch(url: string, queryId?: string, processXml?: string): string | null{
  let result: string | null = null

  const requestParams: HttpRequestParams = {
    url,
    body: processXml,
    method: processXml ? 'POST' : 'GET',
    readTimeout: 30000
  }
  const response: HttpResponse = http.request(requestParams)

  const {
    body,
    status
  } = response

  if (queryId) {
    logUserDataQuery(queryId, {
      file: '/lib/tbml/tbml.ts',
      function: 'fetch',
      message: Events.REQUEST_DATA,
      status: `${status}`,
      request: requestParams,
      response
    })
  }

  if (status === 200 && body) {
    result = body
  } else {
    if (queryId) {
      logUserDataQuery(queryId, {
        file: '/lib/tbml/tbml.ts',
        function: 'fetch',
        message: Events.REQUEST_GOT_ERROR_RESPONSE,
        status: `${status}`,
        response
      })
    }
    log.error(`Failed with status ${status} while fetching tbml data from ${url}`)
  }

  return result
}

export function getTbmlDataGml(url: string, queryId?: string, processXml?: string): TbmlData | null {
  const result: string | null = fetch(url, queryId, processXml)
  if (result) {
    return xmlToJson(result, queryId)
  }
  return null
}

export function getTbmlData(url: string, queryId?: string, processXml?: string): TbmlDataUniform | null {
  const result: string | null = fetch(url, queryId, processXml)
  if (result) {
    const tbmlDataRaw: TbmlDataRaw = xmlToJson(result, queryId)
    log.info('tbmlDataRaw PrettyJSON%s', JSON.stringify(tbmlDataRaw, null, 4))
    const tbmlDataUniform: TbmlDataUniform = getTbmlDataUniform(tbmlDataRaw)
    log.info('tbmlDataUniform PrettyJSON%s', JSON.stringify(tbmlDataUniform, null, 4))

    return tbmlDataUniform
  }
  return null
}

export function getTbmlSourceList(url: string): TbmlSourceList | null {
  const result: string | null = fetch(url)
  if (result) {
    const jsonResult: TbmlSourceList = xmlToJson(result)
    return jsonResult ? jsonResult : null
  }
  return null
}

function getTbmlDataUniform(tbmlDataRaw: TbmlDataRaw ): TbmlDataUniform {
  const tableHead: Array<TableRowUniform> = getTableHead(tbmlDataRaw.tbml.presentation.table.thead)
  const tableBody: Array<TableRowUniform> = getTableBody(tbmlDataRaw.tbml.presentation.table.tbody)
  const metadataUniform: MetadataUniform = getMetadataDataUniform(tbmlDataRaw.tbml.metadata)

  return {
    tbml: {
      presentation: {
        table: {
          thead: tableHead,
          tbody: tableBody,
          class: tbmlDataRaw.tbml.presentation.table.class
        }
      },
      metadata: metadataUniform
    }
  }
}

function getTableHead(thead: TableRowRaw | Array<TableRowRaw>): Array<TableRowUniform> {
  return forceArray(thead)
    .map( (thead: TableRowUniform) => ({
      tr: getTableCellHeader(forceArray(thead.tr))
    }))
}

function getTableBody(tbody: TableRowRaw | Array<TableRowRaw>): Array<TableRowUniform> {
  return forceArray(tbody)
    .map( (tbody: TableRowUniform) => ({
      tr: getTableCellBody(forceArray(tbody.tr))
    }))
}

function getTableCellHeader(tableCell: Array<TableCellRaw>): Array<TableCellUniform> {
  return forceArray(tableCell)
    .map( (cell: TableCellUniform) => ({
      td: typeof cell.td != 'undefined' ? forceArray(cell.td) : undefined,
      th: typeof cell.th != 'undefined' ? forceArray(cell.th) : undefined
    }))
}

function getTableCellBody(tableCell: Array<TableCellRaw>): Array<TableCellUniform> {
  return forceArray(tableCell)
    .map( (cell: TableCellUniform) => ({
      th: typeof cell.th != 'undefined' ? forceArray(cell.th) : undefined,
      td: typeof cell.td != 'undefined' ? forceArray(cell.td) : undefined
    }))
}

function getMetadataDataUniform(metadataRaw: MetadataRaw ): MetadataUniform {
  const title: Title = typeof(metadataRaw.title) == 'string' ?
    {
      noterefs: '',
      content: metadataRaw.title
    } :
    metadataRaw.title

  const publicRelatedTableIds: string | number | undefined = metadataRaw.instance.publicRelatedTableIds
  const relatedTableIds: string = metadataRaw.instance.relatedTableIds
  const notes: Array<Note> = metadataRaw.notes ? forceArray(metadataRaw.notes.note) : []

  return {
    instance: {
      publicRelatedTableIds: publicRelatedTableIds ? publicRelatedTableIds.toString().split(' ') : [],
      language: metadataRaw.instance['xml:lang'],
      relatedTableIds: relatedTableIds ? relatedTableIds.toString().split(' ') : [],
      definitionId: metadataRaw.instance.definitionId
    },
    tablesource: metadataRaw.tablesource,
    title: title,
    category: metadataRaw.category,
    shortnameweb: metadataRaw.shortnameweb,
    tags: metadataRaw.tags,
    notes: {
      note: notes
    }
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
        message: Events.XML_TO_JSON
      })
    }
    throw new Error( `Failed while parsing tbml data: ${e}`)
  }
}

export interface TbmlLib {
  fetch: (url: string, queryId?: string, token?: string) => string;
  getTbmlData: (url: string, queryId?: string, processXml?: string) => TbmlData | null;
  getTbmlSourceList: (tbmlId: string) => TbmlSourceList | null;
}

export interface Authorization {
  Authorization: string;
}
