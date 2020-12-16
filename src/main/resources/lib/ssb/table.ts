__non_webpack_require__('/lib/polyfills/nashorn')
/* eslint-disable new-cap */
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import { JSONstat } from '../../types/jsonstat-toolkit'
import { Content } from 'enonic-types/content'
import { Table } from '../../site/content-types/table/table'
import { TbmlDataUniform,
  TableRowUniform,
  TableCellUniform,
  Note,
  Notes,
  PreliminaryData,
  Title,
  Source, Thead, TableRowRaw, TableCellRaw } from '../types/xmlParser'
import { Dataset as JSDataset } from '../types/jsonstat-toolkit'
import { Request } from 'enonic-types/controller'
import { DatasetRepoNode, RepoDatasetLib } from '../repo/dataset'
import { DataSource as DataSourceType } from '../repo/dataset'
import { StatbankSavedLib } from './dataset/statbankSaved'
import { SSBCacheLibrary } from './cache'

const {
  data: {
    forceArray
  }
} = __non_webpack_require__( '/lib/util')

const {
  getDataset
} = __non_webpack_require__( '/lib/ssb/dataset/dataset')

const {
  datasetOrUndefined
}: SSBCacheLibrary = __non_webpack_require__('/lib/ssb/cache')
const {
  fetchStatbankSavedData
}: StatbankSavedLib = __non_webpack_require__('/lib/ssb/dataset/statbankSaved')

const {
  DATASET_BRANCH,
  UNPUBLISHED_DATASET_BRANCH
}: RepoDatasetLib = __non_webpack_require__('/lib/repo/dataset')

export function parseTable(req: Request, table: Content<Table>, branch: string = DATASET_BRANCH): TableView {
  let tableViewData: TableView = {
    caption: undefined,
    thead: [],
    tbody: [],
    tfoot: {
      footnotes: [],
      correctionNotice: ''
    },
    tableClass: '',
    noteRefs: [],
    sourceList: []
  }

  let datasetRepo: DatasetRepoNode<JSONstat> | undefined
  if (branch === UNPUBLISHED_DATASET_BRANCH) {
    datasetRepo = getDataset(table, UNPUBLISHED_DATASET_BRANCH)
  } else {
    datasetRepo = datasetOrUndefined(table)
  }

  const dataSource: Table['dataSource'] | undefined = table.data.dataSource

  if (datasetRepo) {
    const data: JSDataset | Array<JSDataset> | null | TbmlDataUniform = datasetRepo.data

    if (dataSource && dataSource._selected === DataSourceType.TBPROCESSOR) {
      const tbmlData: TbmlDataUniform = data as TbmlDataUniform
      if (tbmlData && tbmlData.tbml && tbmlData.tbml.metadata && tbmlData.tbml.presentation) {
        const title: Title = tbmlData.tbml.metadata.title
        const notes: Notes | undefined = tbmlData.tbml.metadata.notes
        const sourceList: Array<Source> = tbmlData.tbml.metadata && tbmlData.tbml.metadata.sourceList ? tbmlData.tbml.metadata.sourceList : []

        tableViewData = getTableViewData(table, tbmlData.tbml.presentation, title, notes, sourceList, DataSourceType.TBPROCESSOR)
      }
    }
  }

  if (dataSource && dataSource._selected === DataSourceType.STATBANK_SAVED) {
    const statbankSavedData: JSONstat | null = fetchStatbankSavedData(table)
    const parsedStatbankSavedData: JSONstat | null = JSON.parse(statbankSavedData.json)

    const title: Title = parsedStatbankSavedData.table.caption
    const notes: Notes | undefined = undefined // TODO: no metadata.notes in the statbankSaved json data yet
    const sourceList: Array<Source> = [] // TODO: no sourceList in the statbankSaved json data

    tableViewData = getTableViewData(table, parsedStatbankSavedData, title, notes, sourceList, DataSourceType.STATBANK_SAVED)
  }
  return tableViewData
}

function mergeTableRows(rows: TableRowRaw | Array<TableRowRaw>): Array<TableRowUniform> {
  return forceArray(rows).reduce( (acc: Array<TableRowUniform>, row: TableRowRaw ) => {
    const tr: Array<TableRowUniform> = !Array.isArray(row) ? forceArray(row.tr) as Array<TableRowUniform> : []
    if (tr) acc.push(...tr)
    return acc
  }, [])
}

function getTableViewData(table: Content<Table>, dataContent: TbmlDataUniform | JSONstat,
  title: Title | undefined, notes: Notes | undefined, sourceList: Array<Source>, datasource: string): TableView {
  let headRows: Array<TableRowUniform> = []
  let bodyRows: Array<TableRowUniform> = []
  let headNoteRefs: Array<string> = []
  let bodyNoteRefs: Array<string> = []
  let noteRefs: Array<string> = []

  if (datasource === DataSourceType.TBPROCESSOR) {
    headRows = dataContent.table.thead
    bodyRows = dataContent.table.tbody

    headNoteRefs = headRows.reduce((acc: Array<string>, row: TableRowUniform) => {
      const tableCells: Array<TableCellUniform> = row.tr
      tableCells.map((cell: TableCellUniform) => {
        if (cell) acc.push(...getNoterefsHeader(cell))
      })
      return acc
    }, [])

    bodyNoteRefs = bodyRows.reduce((acc: Array<string>, row: TableRowUniform) => {
      const tableCells: Array<TableCellUniform> = row.tr
      tableCells.map((cell: TableCellUniform) => {
        if (cell) acc.push(...getNoterefsHeader(cell))
      })
      return acc
    }, [])

    noteRefs = title && title.noterefs ?
      [title.noterefs, ...headNoteRefs, ...bodyNoteRefs] :
      [...headNoteRefs, ...bodyNoteRefs]
  }

  if (datasource === DataSourceType.STATBANK_SAVED) {
    headRows = forceArray(dataContent.table.thead)
      .map( (thead: Thead) => ({
        tr: getTableCellHeader(forceArray(thead.tr))
      }))

    bodyRows = forceArray(dataContent.table.tbody)
      .map( (tbody: Thead) => ({
        tr: getTableCellBody(forceArray(tbody.tr))
      }))
  }

  const notesList: Array<Note> = notes ? forceArray(notes.note) : []

  return {
    caption: title,
    thead: headRows,
    tbody: bodyRows,
    tableClass: dataContent.class ? dataContent.class : 'statistics',
    tfoot: {
      footnotes: notesList,
      correctionNotice: table.data.correctionNotice || ''
    },
    noteRefs,
    sourceList
  }
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

function getNoterefsHeader(row: TableCellUniform): Array<string> {
  const values: Array<number | string | PreliminaryData> = forceArray(row.th)
  const noteRefs: Array<string> = []
  values.map((cell: number | string | PreliminaryData) => {
    if (typeof cell === 'object') {
      if (cell.noterefs && noteRefs && !noteRefs.includes(cell.noterefs)) {
        noteRefs.push(cell.noterefs)
      }
    }
  })
  return noteRefs
}

interface TableView {
  caption?: Title;
  thead: Array<TableRowUniform>;
  tbody: Array<TableRowUniform>;
  tfoot: {
    footnotes: Array<Note>;
    correctionNotice: string;
  };
  tableClass: string;
  noteRefs: Array<string>;
  sourceList: Source | Array<Source> | undefined;
}
