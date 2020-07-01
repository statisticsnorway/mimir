import { ContentLibrary, Content, QueryResponse } from 'enonic-types/lib/content'
import { DataSource } from '../../../site/mixins/dataSource/dataSource'
import { DataSource as DataSourceType, DatasetRepoNode, RepoDatasetLib } from '../../repo/dataset'
import { StatbankApiLib } from './statbankApi'
import { JSONstat } from '../../types/jsonstat-toolkit'
import { logUserDataQuery, Events } from '../../repo/query'

const {
  query
}: ContentLibrary = __non_webpack_require__('/lib/xp/content')
const {
  getStatbankApi,
  fetchStatbankApiData,
  getStatbankApiKey
}: StatbankApiLib = __non_webpack_require__('/lib/ssb/dataset/statbankApi')
const {
  createOrUpdateDataset
}: RepoDatasetLib = __non_webpack_require__('/lib/repo/dataset')

export function getDataset(content: Content<DataSource>): DatasetRepoNode<JSONstat> | null {
  switch (content.data.dataSource?._selected) {
  case DataSourceType.STATBANK_API: {
    return getStatbankApi(content)
  }
  default: {
    return null
  }
  }
}

export function refreshDataset(content: Content<DataSource>): CreateOrUpdateStatus {
  let data: JSONstat | null = null
  let key: string | undefined
  switch (content.data.dataSource?._selected) {
  case DataSourceType.STATBANK_API: {
    key = getStatbankApiKey(content)
    data = fetchStatbankApiData(content)
  }
  }

  if (!data || !content.data.dataSource || !content.data.dataSource._selected || !key) {
    logUserDataQuery(content._id, {
      message: Events.FAILED_TO_GET_DATA
    } )
    return {
      dataquery: content,
      status: Events.FAILED_TO_GET_DATA,
      dataset: null,
      newDatasetData: false
    }
  } else {
    let dataset: DatasetRepoNode<JSONstat> | null = getDataset(content)
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

function isDataNew(data: JSONstat, dataset: DatasetRepoNode<JSONstat> | null): boolean {
  if (!dataset) {
    return true
  } else if (data && dataset) {
    return JSON.stringify(dataset.data, null, 0) !== JSON.stringify(data, null, 0)
  }
  return false
}

export interface CreateOrUpdateStatus {
  dataquery: Content<DataSource>;
  dataset: DatasetRepoNode<JSONstat> | null;
  newDatasetData: boolean;
  status: string;
}
