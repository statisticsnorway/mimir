import { HttpLibrary, HttpRequestParams, HttpResponse } from 'enonic-types/http'
import { TbmlData,
  TbmlDataRaw,
  TableRowRaw,
  TableCellRaw,
  HeaderCellRaw,
  DataCellRaw,
  TbmlDataUniform,
  TableRowUniform,
  TableCellUniform,
  HeaderCellUniform,
  DataCellUniform,
  MetadataUniform,
  TbmlSourceList,
  XmlParser,
  TableRaw,
  MetadataRaw,
  Title,
  Source,
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

export function getTbmlData(url: string, queryId?: string, processXml?: string): TbmlDataRaw | null {
  const result: string | null = fetch(url, queryId, processXml)
  if (result) {
    const tbmlDataRaw: TbmlDataRaw = xmlToJson(result, queryId)
    // log.info('tbmlDataRaw PrettyJSON%s',JSON.stringify(tbmlDataRaw ,null,4));
    log.info('UNIFORM')
    const tbmlDataUniform: TbmlDataUniform = getTbmlDataUniform(tbmlDataRaw)
    log.info('tbmlDataUniform PrettyJSON%s', JSON.stringify(tbmlDataUniform, null, 4))

    return tbmlDataRaw
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
  const tableHead: Array<TableRowUniform> = mergeTableRows(tbmlDataRaw.tbml.presentation.table.thead)
  const tableBody: Array<TableRowUniform> = mergeTableRows(tbmlDataRaw.tbml.presentation.table.tbody)
  const metadataUniform: MetadataUniform = getMetadataDataUniform(tbmlDataRaw.tbml.metadata)

  const tbmlDataUniform: TbmlDataUniform = {
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

  return tbmlDataUniform
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
  const notes: Array<Note> = forceArray(metadataRaw.notes)
  const sourceList: Array<Source> = forceArray(metadataRaw.sourceList)

  const metaData: MetadataUniform = {
    instance: {
      publicRelatedTableIds: publicRelatedTableIds ? publicRelatedTableIds.toString().split(' ') : [],
      language: metadataRaw.instance['xml:lang'],
      relatedTableIds: relatedTableIds.split(' '),
      definitionId: metadataRaw.instance.definitionId
    },
    tablesource: metadataRaw.tablesource,
    title: title,
    category: metadataRaw.category,
    tags: metadataRaw.tags,
    notes: notes,
    sourceList: sourceList
  }

  return metaData
}

function mergeTableRows(tableRow: TableRowRaw | Array<TableRowRaw>): Array<TableRowUniform> {
  return forceArray(tableRow)
}

function mergeTableCells(tableCell: TableCellRaw | Array<TableCellRaw>): TableCellUniform {
  return forceArray(tableCell)
}

function mergeHeaderCells(headerCell: HeaderCellRaw): HeaderCellUniform {
  return forceArray(headerCell)
}

function mergeDataCells(dataCell: DataCellRaw): DataCellUniform {
  return forceArray(dataCell)
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
