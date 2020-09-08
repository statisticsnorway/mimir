import { ContentLibrary, Content, QueryResponse } from 'enonic-types/lib/content'
import { DataSource } from '../../../site/mixins/dataSource/dataSource'
import { DataSource as DataSourceType, DatasetRepoNode, RepoDatasetLib } from '../../repo/dataset'
import { StatbankApiLib } from './statbankApi'
import { JSONstat } from '../../types/jsonstat-toolkit'
import { RepoQueryLib } from '../../repo/query'
import { TbmlData } from '../../types/xmlParser'
import { TbprocessorLib } from './tbprocessor'

const {
  logUserDataQuery, Events
}: RepoQueryLib = __non_webpack_require__('/lib/repo/query')
const {
  query
}: ContentLibrary = __non_webpack_require__('/lib/xp/content')
const {
  getStatbankApi,
  fetchStatbankApiData,
  getStatbankApiKey
}: StatbankApiLib = __non_webpack_require__('/lib/ssb/dataset/statbankApi')
const {
  getTbprocessor,
  getTbprocessorKey,
  fetchTbprocessorData
}: TbprocessorLib = __non_webpack_require__('/lib/ssb/dataset/tbprocessor')
const {
  createOrUpdateDataset,
  deleteDataset: deleteDatasetFromRepo
}: RepoDatasetLib = __non_webpack_require__('/lib/repo/dataset')

export function getDataset(content: Content<DataSource>): DatasetRepoNode<JSONstat | TbmlData> | null {
  switch (content.data.dataSource?._selected) {
  case DataSourceType.STATBANK_API: {
    return getStatbankApi(content)
  }
  case DataSourceType.TBPROCESSOR: {
    return getTbprocessor(content)
  }
  default: {
    return null
  }
  }
}

export function extractKey(content: Content<DataSource>): string | null {
  switch (content.data.dataSource?._selected) {
  case DataSourceType.STATBANK_API:
    return getStatbankApiKey(content)
  case DataSourceType.TBPROCESSOR:
    return getTbprocessorKey(content)
  default:
    return null
  }
}

function extractData(content: Content<DataSource>): JSONstat | TbmlData | null {
  switch (content.data.dataSource?._selected) {
  case DataSourceType.STATBANK_API:
    return fetchStatbankApiData(content)
  case DataSourceType.TBPROCESSOR:
    return fetchTbprocessorData(content)
  default:
    return null
  }
}

export function refreshDataset(content: Content<DataSource>, asUser: boolean = true): CreateOrUpdateStatus {
  const data: JSONstat | TbmlData | null = extractData(content)
  const key: string | null = extractKey(content)

  if (data && content.data.dataSource && content.data.dataSource._selected && key) {
    let dataset: DatasetRepoNode<JSONstat | TbmlData> | null = getDataset(content)
    const hasNewData: boolean = isDataNew(data, dataset)
    if (!dataset || hasNewData) {
      dataset = createOrUpdateDataset(content.data.dataSource?._selected, key, data)
    }
    return {
      dataquery: content,
      status: !hasNewData ? Events.NO_NEW_DATA : Events.GET_DATA_COMPLETE,
      newDatasetData: hasNewData,
      dataset
    }
  } else {
    if (asUser) {
      logUserDataQuery(content._id, {
        message: Events.FAILED_TO_GET_DATA
      })
    }
    return {
      dataquery: content,
      status: Events.FAILED_TO_GET_DATA,
      dataset: null,
      newDatasetData: false
    }
  }
}

export function deleteDataset(content: Content<DataSource>): boolean {
  let key: string | undefined
  switch (content.data.dataSource?._selected) {
  case DataSourceType.STATBANK_API: {
    key = getStatbankApiKey(content)
    break
  }
  case DataSourceType.TBPROCESSOR: {
    key = getTbprocessorKey(content)
    break
  }
  }
  if (content.data.dataSource && content.data.dataSource._selected && key) {
    return deleteDatasetFromRepo(content.data.dataSource._selected, key)
  } else {
    return false
  }
}

export function getContentWithDataSource(): Array<Content<DataSource>> {
  let start: number = 0
  let count: number = 100
  let hits: Array<Content<DataSource>> = []
  while (count === 100) {
    const result: QueryResponse<DataSource> = query({
      start,
      count,
      query: `data.dataSource._selected LIKE "*"`
    })
    count = result.count
    start += count
    hits = hits.concat(result.hits)
  }
  return hits
}

function isDataNew(data: JSONstat | TbmlData, dataset: DatasetRepoNode<JSONstat | TbmlData> | null): boolean {
  if (!dataset) {
    return true
  } else if (data && dataset) {
    return JSON.stringify(dataset.data, null, 0) !== JSON.stringify(data, null, 0)
  }
  return false
}

export interface CreateOrUpdateStatus {
  dataquery: Content<DataSource>;
  dataset: DatasetRepoNode<JSONstat | TbmlData> | null;
  newDatasetData: boolean;
  status: string;
}

export interface DatasetLib {
  extractKey: (content: Content<DataSource>) => string;
  getDataset: (content: Content<DataSource>) => DatasetRepoNode<JSONstat | TbmlData> | null;
  refreshDataset: (content: Content<DataSource>, asUser: boolean) => CreateOrUpdateStatus;
  deleteDataset: (content: Content<DataSource>) => boolean;
  getContentWithDataSource: () => Array<Content<DataSource>>;
  isDataNew: (data: JSONstat | TbmlData, dataset: DatasetRepoNode<JSONstat | TbmlData> | null) => boolean;
}
