__non_webpack_require__('/lib/polyfills/nashorn')
/* eslint-disable new-cap */
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import { JSONstat } from '../../types/jsonstat-toolkit'
import { Content } from 'enonic-types/content'
import { Table } from '../../site/content-types/table/table'
import { TbmlData, TableRow, Note, Notes, PreliminaryData, Title, Source } from '../types/xmlParser'
import { Dataset as JSDataset } from '../types/jsonstat-toolkit'
import { Request } from 'enonic-types/controller'
import { DatasetRepoNode, RepoDatasetLib } from '../repo/dataset'
import { DataSource as DataSourceType } from '../repo/dataset'
import { StatbankSavedLib } from './dataset/statbankSaved'
import { SSBCacheLibrary } from './cache'
import { Thead } from '../types/xmlParser'

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
    const data: JSDataset | Array<JSDataset> | null | TbmlData = datasetRepo.data

    if (dataSource && dataSource._selected === DataSourceType.TBPROCESSOR) {
      const tbmlData: TbmlData = data as TbmlData
      const title: Title | undefined = tbmlData.tbml.metadata ? tbmlData.tbml.metadata.title : undefined
      const notes: Notes | undefined = tbmlData.tbml.metadata ? tbmlData.tbml.metadata.notes : undefined
      const sourceList: Source | Array<Source> | undefined = tbmlData.tbml.metadata.sourceList

      tableViewData = tbmlData.tbml.presentation ? getTableViewData(table, tbmlData.tbml.presentation, title, notes, sourceList) : tableViewData
    }
  }

  if (dataSource && dataSource._selected === DataSourceType.STATBANK_SAVED) {
    const statbankSavedData: JSONstat | null = fetchStatbankSavedData(table)
    const parsedStatbankSavedData: JSONstat | null = JSON.parse(statbankSavedData.json)

    const title: Title = parsedStatbankSavedData.table.caption
    const notes: Notes | undefined = undefined // TODO: no metadata.notes in the statbankSaved json data yet
    const sourceList: Source | Array<Source> | undefined = undefined // TODO: no sourceList in the statbankSaved json data

    tableViewData = getTableViewData(table, parsedStatbankSavedData, title, notes, sourceList)
  }
  return tableViewData
}

function mergeTableRows(thead: Array<Thead>): Array<TableRow> {
  return thead.reduce( (acc: Array<TableRow>, thead: Thead ) => {
    const tr: Array<TableRow> | undefined = !Array.isArray(thead) ? thead.tr as Array<TableRow> : undefined
    if (tr) acc.push(...tr)
    return acc
  }, [])
}

function getTableViewData(table: Content<Table>, dataContent: TbmlData | JSONstat,
  title: Title | undefined, notes: Notes | undefined, sourceList: Source | Array<Source> | undefined): TableView {
  const headRows: Array<Thead> = forceArray(dataContent.table.thead)
    .map( (thead: Thead) => ({
      tr: forceArray(thead.tr)
    }))

  const bodyRows: Array<Thead> = forceArray(dataContent.table.tbody)
    .map( (tbody: Thead) => ({
      tr: forceArray(tbody.tr)
    }))

  const headNoteRefs: Array<string> = mergeTableRows(headRows).reduce((acc: Array<string>, row: TableRow) => {
    if (row) acc.push(...getNoterefs(row))
    return acc
  }, [])

  const bodyNoteRefs: Array<string> = mergeTableRows(bodyRows).reduce((acc: Array<string>, row: TableRow) => {
    if (row) acc.push(...getNoterefs(row))
    return acc
  }, [])

  const noteRefs: Array<string> = title && title.noterefs ?
    [title.noterefs, ...headNoteRefs, ...bodyNoteRefs] :
    [...headNoteRefs, ...bodyNoteRefs]

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

function getNoterefs(row: TableRow): Array<string> {
  return forceArray(row.th).reduce((acc: Array<string>, cell: string | number | PreliminaryData) => {
    if (typeof cell === 'object') {
      if (cell.noterefs && acc && acc.includes(cell.noterefs)) {
        acc.push(cell.noterefs)
      }
    }
  }, [])
}

interface TableView {
  caption?: Title;
  thead: Array<Thead>;
  tbody: Array<Thead>;
  tfoot: {
    footnotes: Array<Note>;
    correctionNotice: string;
  };
  tableClass: string;
  noteRefs: Array<string>;
  sourceList: Source | Array<Source> | undefined;
}
