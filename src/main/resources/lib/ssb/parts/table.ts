import '/lib/ssb/polyfills/nashorn'
// @ts-ignore
import striptags from 'striptags'
import { type Request } from '@enonic-types/core'
import { Content } from '/lib/xp/content'
import {
  type TbmlDataUniform,
  type TableRowUniform,
  type TableCellUniform,
  type Note,
  type NotesUniform,
  type PreliminaryData,
  type Title,
  type Source,
  type Thead,
  type StatbankSavedRaw,
  type StatbankSavedUniform,
  type TableCellRaw,
  type XmlParser,
} from '/lib/types/xmlParser'
import {
  DatasetRepoNode,
  DataSource as DataSourceType,
  DATASET_BRANCH,
  UNPUBLISHED_DATASET_BRANCH,
} from '/lib/ssb/repo/dataset'

import * as util from '/lib/util'
import { getDataset } from '/lib/ssb/dataset/dataset'
import { datasetOrUndefined } from '/lib/ssb/cache/cache'
import { getRowValue } from '/lib/ssb/utils/utils'
import {
  type DatasourceHtmlTable,
  type HtmlTable,
  type HtmlTableRaw,
  type HtmlTableRowRaw,
  type BodyCell,
  type TableView,
} from '/lib/types/partTypes/table'
import { type DataSource } from '/site/mixins/dataSource'
import { type Table } from '/site/content-types'

const xmlParser: XmlParser = __.newBean('no.ssb.xp.xmlparser.XmlParser') as XmlParser

export function parseTable(
  req: Request,
  table: Content<Table & DataSource>,
  branch: string = DATASET_BRANCH
): TableView {
  let tableViewData: TableView = {
    caption: undefined,
    thead: [],
    tbody: [],
    tfoot: {
      footnotes: [],
      correctionNotice: '',
    },
    tableClass: '',
    noteRefs: [],
    sourceList: [],
  }
  const dataSource: DataSource['dataSource'] | undefined = table.data.dataSource

  if (dataSource && dataSource._selected === DataSourceType.HTMLTABLE) {
    return parseHtmlTable(table)
  }

  let datasetRepo: DatasetRepoNode<TbmlDataUniform | StatbankSavedRaw | object> | undefined | null
  if (branch === UNPUBLISHED_DATASET_BRANCH) {
    datasetRepo = getDataset(table, UNPUBLISHED_DATASET_BRANCH)
  } else {
    datasetRepo = datasetOrUndefined(table)
  }

  if (datasetRepo) {
    const data: string | TbmlDataUniform | StatbankSavedRaw | object | undefined = datasetRepo.data

    if (dataSource && dataSource._selected === DataSourceType.TBPROCESSOR) {
      const tbmlData: TbmlDataUniform = data as TbmlDataUniform
      if (tbmlData?.tbml?.metadata && tbmlData?.tbml?.presentation) {
        tableViewData = getTableViewData(tbmlData, table)
      }
    }

    if (dataSource && dataSource._selected === DataSourceType.STATBANK_SAVED) {
      const statbankSavedData: StatbankSavedRaw | null = data as StatbankSavedRaw
      const parsedStatbankSavedData: StatbankSavedUniform = statbankSavedData
        ? JSON.parse(statbankSavedData.json)
        : null
      if (parsedStatbankSavedData) {
        tableViewData = getTableViewDataStatbankSaved(parsedStatbankSavedData)
      }
    }
    if (dataSource && dataSource._selected === DataSourceType.PXAPI) {
      const parsed = typeof data === 'string' ? JSON.parse(data) : data
      tableViewData = parsePxApiTable(parsed as object, table)
    }
  }
  return tableViewData
}

function parsePxApiTable(json: object, table?: Content<Table>): TableView {
  const empty: TableView = {
    caption: undefined,
    thead: [],
    tbody: [],
    tfoot: { footnotes: [], correctionNotice: '' },
    tableClass: '',
    noteRefs: [],
    sourceList: [],
  }

  const d = json as {
    id: string[]
    size: number[]
    value: (number | null)[]
    dimension: {
      [key: string]: {
        category: {
          index: { [key: string]: number }
          label?: { [key: string]: string }
        }
      }
    }
    extension?: {
      px?: {
        stub?: string[]
        heading?: string[]
      }
    }
  }

  if (!d.id || !d.size || !d.value || !d.dimension) return empty
  if (!d.extension || !d.extension.px) return empty

  const stub = d.extension.px.stub || []
  const heading = d.extension.px.heading || []

  if (stub.length === 0 || heading.length === 0) return empty

  const rowDimId = stub[0]
  const colDimId = heading[heading.length - 1]

  const rowDim = d.dimension[rowDimId]
  const colDim = d.dimension[colDimId]

  if (!rowDim || !colDim) return empty

  const rowIndex = rowDim.category.index
  const colIndex = colDim.category.index

  const rowKeys = Object.keys(rowIndex).sort((a, b) => rowIndex[a] - rowIndex[b])
  const colKeys = Object.keys(colIndex).sort((a, b) => colIndex[a] - colIndex[b])

  const dimPos: { [key: string]: number } = {}
  for (let i = 0; i < d.id.length; i++) dimPos[d.id[i]] = i

  const filter: number[] = []
  for (let i = 0; i < d.id.length; i++) filter.push(0)

  const headerCells: Array<number | string | PreliminaryData> = ['']
  for (let i = 0; i < colKeys.length; i++) {
    const k = colKeys[i]
    headerCells.push((colDim.category.label && colDim.category.label[k]) || k)
  }

  const thead: TableRowUniform[] = [{ tr: [{ th: headerCells, td: [] }] }]

  const bodyRows: TableCellUniform[] = []

  for (let r = 0; r < rowKeys.length; r++) {
    const rowKey = rowKeys[r]
    filter[dimPos[rowDimId]] = rowIndex[rowKey]

    const rowValues: Array<number | string | PreliminaryData> = []

    for (let c = 0; c < colKeys.length; c++) {
      const colKey = colKeys[c]
      filter[dimPos[colDimId]] = colIndex[colKey]

      let idx = 0
      let mult = 1

      for (let s = d.size.length - 1; s >= 0; s--) {
        idx += filter[s] * mult
        mult *= d.size[s]
      }

      const v = d.value[idx]
      rowValues.push(typeof v === 'number' ? v : '')
    }

    bodyRows.push({
      th: [(rowDim.category.label && rowDim.category.label[rowKey]) || rowKey],
      td: rowValues,
    })
  }

  return {
    caption: { content: table?.displayName || '', noterefs: '' },
    thead,
    tbody: [{ tr: bodyRows }],
    tableClass: 'statistics',
    tfoot: {
      footnotes: [],
      correctionNotice: table?.data.correctionNotice || '',
    },
    noteRefs: [],
    sourceList: [],
  }
}

function parseHtmlTable(table: Content<Table & DataSource>): TableView {
  const dataSource: DataSource['dataSource'] | undefined = table.data.dataSource
  const datasourceHtmlTable: DatasourceHtmlTable | undefined =
    dataSource && dataSource._selected === DataSourceType.HTMLTABLE
      ? (dataSource.htmlTable as DatasourceHtmlTable)
      : undefined
  const tableData: string | undefined = datasourceHtmlTable ? datasourceHtmlTable.html : undefined
  const jsonTable: HtmlTableRaw | undefined = tableData
    ? parseStringToJson(tableData.replace(/&nbsp;/g, ' '))
    : undefined
  const tableRows: Array<HtmlTableRowRaw> = jsonTable ? util.data.forceArray(jsonTable.table.tbody.tr) : []
  const numberHeadRows: number =
    datasourceHtmlTable && datasourceHtmlTable.numberHeadRows ? Number(datasourceHtmlTable.numberHeadRows) : 1
  const theadRows: Array<HtmlTableRowRaw> = tableRows.slice(0, numberHeadRows)
  const tbodyRows: Array<HtmlTableRowRaw> = tableRows.slice(numberHeadRows)
  const footNotes: Array<string> = datasourceHtmlTable?.footnoteText
    ? util.data.forceArray(datasourceHtmlTable.footnoteText)
    : []
  const correctionText: string = table.data.correctionNotice || ''
  const noteRefs: Array<string> = footNotes ? footNotes.map((_note: string, index: number) => `note:${index + 1}`) : []
  const notes: Array<Note> = footNotes
    ? footNotes.map((note: string, index: number) => {
        return {
          noteid: `note:${index + 1}`,
          content: note,
        }
      })
    : []

  const thead: Array<TableRowUniform> = [
    {
      tr: theadRows.map((row) => {
        return {
          th: getHtmlTableCells(row),
          td: [],
        }
      }),
    },
  ]

  const tbody: Array<TableRowUniform> = [
    {
      tr: tbodyRows.map((row) => {
        const cells: Array<number | string | PreliminaryData> = getHtmlTableCells(row)
        return {
          th: util.data.forceArray(cells[0]),
          td: cells.slice(1),
        }
      }),
    },
  ]

  return {
    caption: {
      noterefs: '',
      content: table.displayName,
    },
    thead: thead,
    tbody: tbody,
    tfoot: {
      footnotes: notes,
      correctionNotice: correctionText,
    },
    tableClass: 'statistics',
    noteRefs: noteRefs,
    sourceList: [],
  }
}

function getHtmlTableCells(row: HtmlTableRowRaw): Array<number | string | PreliminaryData> {
  const tablecells: Array<number | string | PreliminaryData> = util.data.forceArray(row.td)
  return tablecells.map((cell) => {
    return typeof cell === 'object' && cell.strong
      ? {
          ...cell,
          content: cell.strong,
          class: 'title',
        }
      : cell
  })
}

export function getTableViewData(dataContent: TbmlDataUniform, table?: Content<Table>): TableView {
  const title: Title = dataContent.tbml.metadata.title
  const notes: NotesUniform = dataContent.tbml.metadata.notes
  const sourceList: Array<Source> = dataContent?.tbml?.metadata?.sourceList || []
  const headRows: Array<TableRowUniform> = util.data.forceArray(dataContent.tbml.presentation.table.thead)
  const bodyRows: Array<TableRowUniform> = util.data.forceArray(dataContent.tbml.presentation.table.tbody)

  const headNoteRefs: Array<string> = headRows.reduce((acc: Array<string>, row: TableRowUniform) => {
    const tableCells: Array<TableCellUniform> = row.tr
    tableCells.forEach((cell: TableCellUniform) => {
      if (cell) acc.push(...getNoterefsHeader(cell))
    })
    return acc
  }, [])

  const bodyNoteRefs: Array<string> = bodyRows.reduce((acc: Array<string>, row: TableRowUniform) => {
    const tableCells: Array<TableCellUniform> = row.tr
    tableCells.forEach((cell: TableCellUniform) => {
      if (cell) acc.push(...getNoterefsHeader(cell))
    })
    return acc
  }, [])

  const noteRefs: Array<string> = title?.noterefs
    ? [...title.noterefs.split(' '), ...headNoteRefs, ...bodyNoteRefs]
    : [...headNoteRefs, ...bodyNoteRefs]

  const uniqueNoteRefs: Array<string> = noteRefs.filter((v, i, a) => a.indexOf(v) === i)

  return {
    caption: title,
    thead: headRows,
    tbody: bodyRows,
    tableClass: dataContent.tbml.presentation.table.class ? dataContent.tbml.presentation.table.class : 'statistics',
    tfoot: {
      footnotes: notes ? notes.note : [],
      correctionNotice: table?.data.correctionNotice ?? '',
    },
    noteRefs: uniqueNoteRefs,
    sourceList,
  }
}

export function parseHtmlString(tableData: string): HtmlTable {
  const jsonTable: HtmlTableRaw | undefined = parseStringToJson(tableData)
  const tableRows: Array<HtmlTableRowRaw> = jsonTable ? jsonTable.table.tbody.tr : []
  const theadRows: Array<HtmlTableRowRaw> = []
  const tbodyRows: Array<HtmlTableRowRaw> = []

  tableRows.forEach((row: HtmlTableRowRaw, index: number) => {
    if (index > 0) {
      tbodyRows.push(row)
    } else {
      theadRows.push(row)
    }
  })

  const headCell: Array<number | string> = theadRows[0].td.map((dataCell) => {
    const value: number | string = getRowValue(dataCell)
    return typeof value === 'string' ? value.replace(/&nbsp;/g, '') : value
  })

  const bodyCells: Array<BodyCell> = tbodyRows.map((row) => {
    const dataCellValues: Array<number | string> = row.td.map((dataCell) => {
      const value: number | string = getRowValue(dataCell)
      return typeof value === 'string' ? value.replace(/&nbsp;/g, '') : value
    })

    return {
      td: dataCellValues,
    }
  })

  return {
    table: {
      thead: {
        tr: {
          th: headCell,
        },
      },
      tbody: {
        tr: bodyCells,
      },
    },
  }
}

function parseStringToJson(tableData: string): HtmlTableRaw | undefined {
  const sanitized = striptags(tableData, ['table', 'thead', 'tbody', 'tr', 'th', 'td', 'strong'])
  const tableRaw: string = __.toNativeObject(xmlParser.parse(sanitized)) as string
  const jsonTable: HtmlTableRaw | undefined = tableRaw ? (JSON.parse(tableRaw) as HtmlTableRaw) : undefined
  return jsonTable
}

function getTableViewDataStatbankSaved(dataContent: StatbankSavedUniform): TableView {
  const title: Title = dataContent.table.caption
  const headRows: Array<TableRowUniform> = util.data.forceArray(dataContent.table.thead).map((thead: Thead) => ({
    tr: getTableCellHeader(util.data.forceArray(thead.tr)),
  }))
  const bodyRows: Array<TableRowUniform> = util.data.forceArray(dataContent.table.tbody).map((tbody: Thead) => ({
    tr: getTableCellBody(util.data.forceArray(tbody.tr)),
  }))

  return {
    caption: title,
    thead: headRows,
    tbody: bodyRows,
    tableClass: 'statistics',
    tfoot: {
      footnotes: [],
      correctionNotice: '',
    },
    noteRefs: [],
    sourceList: [],
  }
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

function getNoterefsHeader(row: TableCellUniform): Array<string> {
  const values: Array<number | string | PreliminaryData> = util.data.forceArray(row.th)
  const noteRefs: Array<string> = values.reduce((acc: Array<string>, cell: number | string | PreliminaryData) => {
    if (typeof cell === 'object') {
      if (cell.noterefs) {
        const noteRefs: Array<string> = cell.noterefs.split(' ')
        noteRefs.forEach((noteRef) => {
          if (!acc.includes(noteRef)) {
            acc.push(noteRef)
          }
        })
      }
    }
    return acc
  }, [])
  return noteRefs
}
