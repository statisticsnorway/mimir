/* eslint-disable new-cap */
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import JSONstat from 'jsonstat-toolkit/import.mjs'
import { Content } from 'enonic-types/lib/content'
import { Table } from '../../site/content-types/table/table'
import { TbmlData, TableRow } from '../types/xmlParser'
import { Dataset as JSDataset } from '../types/jsonstat-toolkit'
import { Request } from 'enonic-types/lib/controller'
import { DatasetRepoNode } from '../repo/dataset'
import { DataSource as DataSourceType } from '../repo/dataset'
import { UtilLibrary } from '../types/util'
const {
  getDataset
} = __non_webpack_require__( '/lib/ssb/dataset/dataset')
const util: UtilLibrary = __non_webpack_require__( '/lib/util')


export function parseTable(req: Request, table: Content<Table>): TableView {
  const tableViewData: TableView = {
    caption: undefined,
    thead: undefined,
    tbody: undefined,
    tableClass: undefined
  }

  const datasetRepo: DatasetRepoNode<JSONstat> | null = getDataset(table)

  if (datasetRepo) {
    const dataSource: Table['dataSource'] | undefined = table.data.dataSource
    const data: JSDataset | Array<JSDataset> | null | TbmlData = datasetRepo.data

    if (dataSource && dataSource._selected === DataSourceType.TBPROCESSOR) {
      const tbmlData: TbmlData = data as TbmlData
      const headRows: Array<TableRow> = util.data.forceArray(tbmlData.tbml.presentation.table.thead.tr) as Array<TableRow>
      const bodyRows: Array<TableRow> = util.data.forceArray(tbmlData.tbml.presentation.table.tbody.tr) as Array<TableRow>
      tableViewData.caption = tbmlData.tbml.metadata.title
      tableViewData.thead = headRows
      tableViewData.tbody = bodyRows
      tableViewData.tableClass = tbmlData.tbml.presentation.table.class
    }
    return tableViewData
  }

  return tableViewData
}

interface TableView {
  caption?: string;
  thead?: Array<TableRow>;
  tbody?: Array<TableRow>;
  tableClass?: string;
}
