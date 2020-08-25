/* eslint-disable new-cap */
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import JSONstat from 'jsonstat-toolkit/import.mjs'
import { ContentLibrary, QueryResponse, Content } from 'enonic-types/lib/content'
import { Table } from '../../site/content-types/table/table'
import { TbmlData } from '../types/xmlParser'
import { Dataset as JSDataset } from '../types/jsonstat-toolkit'
import { UtilLibrary } from '../types/util'
import { Request } from 'enonic-types/lib/controller'
import { DatasetRepoNode } from '../repo/dataset'
import { DataSource as DataSourceType } from '../repo/dataset'
const {
  query
}: ContentLibrary = __non_webpack_require__( '/lib/xp/content')
const util: UtilLibrary = __non_webpack_require__( '/lib/util')
const {
  getDataset
} = __non_webpack_require__( '/lib/ssb/dataset/dataset')


const contentTypeName: string = `${app.name}:table`

export function get(keys: string | Array<string>): Array<Content<Table>> {
  keys = util.data.forceArray(keys) as Array<string>
  const content: QueryResponse<Table> = query({
    contentTypes: [contentTypeName],
    query: ``,
    count: keys.length,
    start: 0,
    filters: {
      ids: {
        values: keys
      }
    }
  })
  const hits: Array<Content<Table>> = keys.reduce((tables: Array<Content<Table>>, id: string) => {
    const found: Array<Content<Table>> = content.hits.filter((table) => table._id === id)
    if (found.length === 1) {
      tables.push(found[0])
    }
    return tables
  }, [])
  return hits
}

export function parseTable(req: Request, table: Content<Table>): TableView {
  const tableViewData: TableView = {
    title: table.displayName,
    tbmlData: undefined
  }

  const datasetRepo: DatasetRepoNode<JSONstat> | null = getDataset(table)

  if (datasetRepo) {
    const dataSource: Table['dataSource'] | undefined = table.data.dataSource
    const data: JSDataset | Array<JSDataset> | null | TbmlData = datasetRepo.data

    if (dataSource && dataSource._selected === DataSourceType.TBPROCESSOR) {
      const tbmlData: TbmlData = data as TbmlData
      tableViewData.tbmlData = tbmlData
    }
    return tableViewData
  }

  return tableViewData
}

export interface TableView {
    title: string;
    tbmlData?: TbmlData;
}
