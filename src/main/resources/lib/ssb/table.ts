/* eslint-disable new-cap */
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import JSONstat from 'jsonstat-toolkit/import.mjs'
import { Content } from 'enonic-types/content'
import { Table } from '../../site/content-types/table/table'
import { TbmlData, TableRow, Note, Notes, PreliminaryData, Title } from '../types/xmlParser'
import { Dataset as JSDataset } from '../types/jsonstat-toolkit'
import { Request } from 'enonic-types/controller'
import { DatasetRepoNode } from '../repo/dataset'
import { DataSource as DataSourceType } from '../repo/dataset'
import { UtilLibrary } from '../types/util'
const {
  getDataset,
  extractKey
} = __non_webpack_require__( '/lib/ssb/dataset/dataset')

const {
  fromDatasetRepoCache
} = __non_webpack_require__('/lib/ssb/cache')

const util: UtilLibrary = __non_webpack_require__( '/lib/util')


export function parseTable(req: Request, table: Content<Table>): TableView {
  const tableViewData: TableView = {
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

  const datasetRepo: DatasetRepoNode<JSONstat> | null = datasetOrNull(table)

  if (datasetRepo) {
    const dataSource: Table['dataSource'] | undefined = table.data.dataSource
    const data: JSDataset | Array<JSDataset> | null | TbmlData = datasetRepo.data

    if (dataSource && dataSource._selected === DataSourceType.TBPROCESSOR) {
      const tbmlData: TbmlData = data as TbmlData
      const title: Title = tbmlData.tbml.metadata.title
      const headRows: Array<TableRow> = util.data.forceArray(tbmlData.tbml.presentation.table.thead.tr)
      const bodyRows: Array<TableRow> = util.data.forceArray(tbmlData.tbml.presentation.table.tbody.tr)

      const noteRefs: Array<string> = title.noterefs ? [title.noterefs] : []
      headRows.forEach((row) => getNoterefs(row, noteRefs))
      bodyRows.forEach((row) => getNoterefs(row, noteRefs))

      tableViewData.caption = title
      tableViewData.thead = headRows
      tableViewData.tbody = bodyRows
      tableViewData.tableClass = tbmlData.tbml.presentation.table.class
      tableViewData.tfoot.correctionNotice = table.data.correctionNotice || ''
      tableViewData.noteRefs = noteRefs

      const notes: Notes | undefined = tbmlData.tbml.metadata.notes
      if (notes) {
        const notesList: Array<Note> = util.data.forceArray(notes.note)
        tableViewData.tfoot.footnotes = notesList
      }
    }
    return tableViewData
  }

  return tableViewData
}


function datasetOrNull(table: Content<Table>): DatasetRepoNode<JSONstat> | null {
  return table.data.dataSource && table.data.dataSource._selected ?
    fromDatasetRepoCache(`/${table.data.dataSource._selected}/${extractKey(table)}`,
      () => getDataset(table)) :
    null
}

function getNoterefs(row: TableRow, noteRefs: Array<string>): Array<string> {
  util.data.forceArray(row.th).forEach((cell: string | number | PreliminaryData) => {
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
