/* eslint-disable new-cap */
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import { JSONstat } from '../../types/jsonstat-toolkit'
import { Content } from 'enonic-types/lib/content'
import { Table } from '../../site/content-types/table/table'
import { TbmlData, TableRow, Note, Notes, PreliminaryData, Title } from '../types/xmlParser'
import { Dataset as JSDataset } from '../types/jsonstat-toolkit'
import { Request } from 'enonic-types/lib/controller'
import { DatasetRepoNode } from '../repo/dataset'
import { DataSource as DataSourceType } from '../repo/dataset'
import { StatbankSavedLib } from './dataset/statbankSaved'
import { SSBCacheLibrary } from './cache'

const {
  data: {
    forceArray
  }
} = __non_webpack_require__( '/lib/util')

const {
  datasetOrUndefined
}: SSBCacheLibrary = __non_webpack_require__('/lib/ssb/cache')
const {
  fetchStatbankSavedData
}: StatbankSavedLib = __non_webpack_require__('/lib/ssb/dataset/statbankSaved')

export function parseTable(req: Request, table: Content<Table>): TableView {
  let tableViewData: TableView = {
    caption: undefined,
    thead: [],
    tbody: [],
    tfoot: {
      footnotes: [],
      correctionNotice: ''
    },
    tableClass: '',
    noteRefs: []
  }

  const datasetRepo: DatasetRepoNode<JSONstat> | undefined = datasetOrUndefined(table)
  const dataSource: Table['dataSource'] | undefined = table.data.dataSource

  if (datasetRepo) {
    const data: JSDataset | Array<JSDataset> | null | TbmlData = datasetRepo.data

    if (dataSource && dataSource._selected === DataSourceType.TBPROCESSOR) {
      const tbmlData: TbmlData = data as TbmlData
      const title: Title = tbmlData.tbml.metadata.title
      const notes: Notes | undefined = tbmlData.tbml.metadata.notes

      tableViewData = getTableViewData(table, tbmlData.tbml.presentation, title, notes)
    }
  }

  if (dataSource && dataSource._selected === DataSourceType.STATBANK_SAVED) {
    const statbankSavedData: JSONstat | null = fetchStatbankSavedData(table)
    const parsedStatbankSavedData: JSONstat | null = JSON.parse(statbankSavedData.json)

    const title: Title = parsedStatbankSavedData.table.caption
    const notes: Notes | undefined = undefined // TODO: no metadata.notes in the statbankSaved json data yet

    tableViewData = getTableViewData(table, parsedStatbankSavedData, title, notes)
  }
  return tableViewData
}

function getTableViewData(table: Content<Table>, dataContent: TbmlData | JSONstat, title: Title, notes: Notes | undefined): TableView {
  const headRows: Array<TableRow> = forceArray(dataContent.table.thead.tr)
  const bodyRows: Array<TableRow> = forceArray(dataContent.table.tbody.tr)

  const noteRefs: Array<string> = title.noterefs ? [title.noterefs] : []
  headRows.map((row) => getNoterefs(row, noteRefs))
  bodyRows.map((row) => getNoterefs(row, noteRefs))

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
    noteRefs
  }
}

function getNoterefs(row: TableRow, noteRefs: Array<string>): Array<string> {
  forceArray(row.th).forEach((cell: string | number | PreliminaryData) => {
    if (typeof cell === 'object') {
      if (cell.noterefs && noteRefs.indexOf(cell.noterefs) < 0) {
        noteRefs.push(cell.noterefs)
      }
    }
  })
  return noteRefs
}

interface TableView {
  caption?: Title;
  thead: Array<TableRow>;
  tbody: Array<TableRow>;
  tfoot: {
    footnotes: Array<Note>;
    correctionNotice: string;
  };
  tableClass: string;
  noteRefs: Array<string>;
}
