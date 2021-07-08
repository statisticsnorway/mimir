__non_webpack_require__('/lib/ssb/polyfills/nashorn')
import { Content } from 'enonic-types/content'
import { Table } from '../../../site/content-types/table/table'
import { TbmlDataUniform,
  TableRowUniform,
  TableCellUniform,
  Note,
  NotesUniform,
  PreliminaryData,
  Title,
  Source, Thead, StatbankSavedRaw, StatbankSavedUniform, TableCellRaw } from '../../types/xmlParser'
import { Request } from 'enonic-types/controller'
import { DatasetRepoNode } from '../repo/dataset'
import { DataSource as DataSourceType } from '../repo/dataset'
import { DataSource } from '../../../site/mixins/dataSource/dataSource'

const {
  data: {
    forceArray
  }
} = __non_webpack_require__('/lib/util')
const {
  getDataset
} = __non_webpack_require__('/lib/ssb/dataset/dataset')
const {
  datasetOrUndefined
} = __non_webpack_require__('/lib/ssb/cache/cache')
const {
  fetchStatbankSavedData
} = __non_webpack_require__('/lib/ssb/dataset/statbankSaved/statbankSaved')
const {
  DATASET_BRANCH,
  UNPUBLISHED_DATASET_BRANCH
} = __non_webpack_require__('/lib/ssb/repo/dataset')

export function parseTable(req: Request, table: Content<Table & DataSource>, branch: string = DATASET_BRANCH): TableView {
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

  let datasetRepo: DatasetRepoNode<TbmlDataUniform | StatbankSavedRaw | object> | undefined | null
  if (branch === UNPUBLISHED_DATASET_BRANCH) {
    datasetRepo = getDataset(table, UNPUBLISHED_DATASET_BRANCH)
  } else {
    datasetRepo = datasetOrUndefined(table)
  }

  const dataSource: DataSource['dataSource'] | undefined = table.data.dataSource

  if (datasetRepo) {
    const data: string | TbmlDataUniform | StatbankSavedRaw | object | undefined = datasetRepo.data

    if (dataSource && dataSource._selected === DataSourceType.TBPROCESSOR) {
      const tbmlData: TbmlDataUniform = data as TbmlDataUniform
      if (tbmlData && tbmlData.tbml && tbmlData.tbml.metadata && tbmlData.tbml.presentation) {
        tableViewData = getTableViewData(table, tbmlData)
      }
    }
  }

  if (dataSource && dataSource._selected === DataSourceType.STATBANK_SAVED) {
    const statbankSavedData: StatbankSavedRaw | null = fetchStatbankSavedData(table)
    const parsedStatbankSavedData: StatbankSavedUniform = statbankSavedData ? JSON.parse(statbankSavedData.json) : null
    if (parsedStatbankSavedData) {
      tableViewData = getTableViewDataStatbankSaved(table, parsedStatbankSavedData)
    }
  }
  return tableViewData
}

function getTableViewData(table: Content<Table>, dataContent: TbmlDataUniform ): TableView {
  const title: Title = dataContent.tbml.metadata.title
  const notes: NotesUniform = dataContent.tbml.metadata.notes
  const sourceList: Array<Source> = dataContent.tbml.metadata && dataContent.tbml.metadata.sourceList ? dataContent.tbml.metadata.sourceList : []
  const headRows: Array<TableRowUniform> = forceArray(dataContent.tbml.presentation.table.thead)
  const bodyRows: Array<TableRowUniform> = forceArray(dataContent.tbml.presentation.table.tbody)

  const headNoteRefs: Array<string> = headRows.reduce((acc: Array<string>, row: TableRowUniform) => {
    const tableCells: Array<TableCellUniform> = row.tr
    tableCells.map((cell: TableCellUniform) => {
      if (cell) acc.push(...getNoterefsHeader(cell))
    })
    return acc
  }, [])

  const bodyNoteRefs: Array<string> = bodyRows.reduce((acc: Array<string>, row: TableRowUniform) => {
    const tableCells: Array<TableCellUniform> = row.tr
    tableCells.map((cell: TableCellUniform) => {
      if (cell) acc.push(...getNoterefsHeader(cell))
    })
    return acc
  }, [])

  const noteRefs: Array<string> = title && title.noterefs ?
    [...title.noterefs.split(' '), ...headNoteRefs, ...bodyNoteRefs] :
    [...headNoteRefs, ...bodyNoteRefs]

  const uniqueNoteRefs: Array<string> = noteRefs.filter((v, i, a) => a.indexOf(v) === i)

  return {
    caption: title,
    thead: headRows,
    tbody: bodyRows,
    tableClass: dataContent.tbml.presentation.table.class ? dataContent.tbml.presentation.table.class : 'statistics',
    tfoot: {
      footnotes: notes ? notes.note : [],
      correctionNotice: table.data.correctionNotice || ''
    },
    noteRefs: uniqueNoteRefs,
    sourceList
  }
}

function getTableViewDataStatbankSaved(table: Content<Table>, dataContent: StatbankSavedUniform ): TableView {
  const title: Title = dataContent.table.caption
  const headRows: Array<TableRowUniform> = forceArray(dataContent.table.thead)
    .map( (thead: Thead) => ({
      tr: getTableCellHeader(forceArray(thead.tr))
    }))
  const bodyRows: Array<TableRowUniform> = forceArray(dataContent.table.tbody)
    .map( (tbody: Thead) => ({
      tr: getTableCellBody(forceArray(tbody.tr))
    }))

  return {
    caption: title,
    thead: headRows,
    tbody: bodyRows,
    tableClass: 'statistics',
    tfoot: {
      footnotes: [],
      correctionNotice: ''
    },
    noteRefs: [],
    sourceList: []
  }
}


function getTableCellHeader(tableCell: Array<TableCellRaw>): Array<TableCellUniform> {
  return forceArray(tableCell)
    .map( (cell) => ({
      td: typeof cell.td != 'undefined' ? forceArray(cell.td) : [],
      th: typeof cell.th != 'undefined' ? forceArray(cell.th) : []
    }))
}

function getTableCellBody(tableCell: Array<TableCellRaw>): Array<TableCellUniform> {
  return forceArray(tableCell)
    .map( (cell) => ({
      th: typeof cell.th != 'undefined' ? forceArray(cell.th) : [],
      td: typeof cell.td != 'undefined' ? forceArray(cell.td) : []
    }))
}

function getNoterefsHeader(row: TableCellUniform): Array<string> {
  const values: Array<number | string | PreliminaryData> = forceArray(row.th)
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

export interface TableView {
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

export interface TableLib {
  parseTable: (req: Request, table: Content<Table>, branch?: string) => TableView;
}
