import { ContentLibrary, Content, QueryResponse } from 'enonic-types/lib/content'
import { DataSource } from '../../../site/mixins/dataSource/dataSource'
import { DataSource as DataSourceType, DatasetRepoNode, RepoDatasetLib } from '../../repo/dataset'
import { StatbankApiLib } from './statbankApi'
import { JSONstat } from '../../types/jsonstat-toolkit'
import { RepoQueryLib } from '../../repo/query'
import { TbmlData } from '../../types/xmlParser'
import { TbprocessorLib } from './tbprocessor'
import { KlassLib } from './klass'
import { ContextLibrary, RunContext } from 'enonic-types/lib/context'
import { AuthLibrary, User } from 'enonic-types/lib/auth'
import { StatbankSavedLib } from './statbankSaved'

const {
  logUserDataQuery, Events
}: RepoQueryLib = __non_webpack_require__('/lib/repo/query')
const {
  query
}: ContentLibrary = __non_webpack_require__('/lib/xp/content')
const {
  run
}: ContextLibrary = __non_webpack_require__('/lib/xp/context')
const {
  getUser
}: AuthLibrary = __non_webpack_require__('/lib/xp/auth')
const {
  getStatbankApi,
  fetchStatbankApiData,
  getStatbankApiKey
}: StatbankApiLib = __non_webpack_require__('/lib/ssb/dataset/statbankApi')
const {
  fetchStatbankSavedData
}: StatbankSavedLib = __non_webpack_require__('/lib/ssb/dataset/statbankSaved')
const {
  getTbprocessor,
  getTbprocessorKey,
  fetchTbprocessorData
}: TbprocessorLib = __non_webpack_require__('/lib/ssb/dataset/tbprocessor')
const {
  getKlass,
  getKlassKey,
  fetchKlassData
}: KlassLib = __non_webpack_require__('/lib/ssb/dataset/klass')
const {
  createOrUpdateDataset,
  deleteDataset: deleteDatasetFromRepo
}: RepoDatasetLib = __non_webpack_require__('/lib/repo/dataset')

export function getDataset(content: Content<DataSource>): DatasetRepoNode<JSONstat | TbmlData | object> | null {
  switch (content.data.dataSource?._selected) {
  case DataSourceType.STATBANK_API: {
    return getStatbankApi(content)
  }
  case DataSourceType.TBPROCESSOR: {
    return getTbprocessor(content)
  }
  case DataSourceType.KLASS: {
    return getKlass(content)
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
  case DataSourceType.STATBANK_SAVED:
    return getStatbankApiKey(content)
  case DataSourceType.KLASS:
    return getKlassKey(content)
  default:
    return null
  }
}

function extractData(content: Content<DataSource>): JSONstat | TbmlData | object | null {
  switch (content.data.dataSource?._selected) {
  case DataSourceType.STATBANK_API:
    return fetchStatbankApiData(content)
  case DataSourceType.TBPROCESSOR:
    return fetchTbprocessorData(content)
  case DataSourceType.STATBANK_SAVED:
    return fetchStatbankSavedData(content)
  case DataSourceType.KLASS:
    return fetchKlassData(content)
  default:
    return null
  }
}

export function refreshDataset(content: Content<DataSource>, asUser: boolean = true): CreateOrUpdateStatus {
  const data: JSONstat | TbmlData | object | null = extractData(content)
  const key: string | null = extractKey(content)
  const user: User | null = getUser()

  if (data && content.data.dataSource && content.data.dataSource._selected && key) {
    let dataset: DatasetRepoNode<JSONstat | TbmlData | object> | null = getDataset(content)
    const hasNewData: boolean = isDataNew(data, dataset)
    if (!dataset || hasNewData) {
      dataset = createOrUpdateDataset(content.data.dataSource?._selected, key, data)
    }
    return {
      dataquery: content,
      status: !hasNewData ? Events.NO_NEW_DATA : Events.GET_DATA_COMPLETE,
      newDatasetData: hasNewData,
      dataset,
      user
    }
  } else {
    if (asUser) {
      logUserDataQuery(content._id, {
        file: '/lib/ssb/dataset/dataset.ts',
        function: 'refreshDataset',
        message: Events.FAILED_TO_GET_DATA,
        info: 'Missing data, datasource._selected or key.'
      })
    }
    return {
      dataquery: content,
      status: Events.FAILED_TO_GET_DATA,
      dataset: null,
      newDatasetData: false,
      user
    }
  }
}

export function refreshDatasetWithUserKey(content: Content<DataSource>, userLogin: string): CreateOrUpdateStatus {
  const context: RunContext = {
    branch: 'master',
    repository: 'com.enonic.cms.default',
    principals: ['role:system.admin'],
    user: {
      login: userLogin,
      idProvider: 'system'
    }
  }
  return run(context, () => refreshDataset(content, true))
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
  case DataSourceType.KLASS: {
    key = getKlassKey(content)
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

function isDataNew(data: JSONstat | TbmlData | object, dataset: DatasetRepoNode<JSONstat | TbmlData | object> | null): boolean {
  if (!dataset) {
    return true
  } else if (data && dataset) {
    return JSON.stringify(dataset.data, null, 0) !== JSON.stringify(data, null, 0)
  }
  return false
}

export interface CreateOrUpdateStatus {
  dataquery: Content<DataSource>;
  dataset: DatasetRepoNode<JSONstat | TbmlData | object> | null;
  newDatasetData: boolean;
  status: string;
  user: User | null;
}

export interface DatasetLib {
  extractKey: (content: Content<DataSource>) => string;
  getDataset: (content: Content<DataSource>) => DatasetRepoNode<JSONstat | TbmlData | object> | null;
  refreshDataset: (content: Content<DataSource>, asUser: boolean) => CreateOrUpdateStatus;
  refreshDatasetWithUserKey: (content: Content<DataSource>, userLogin: string) => CreateOrUpdateStatus;
  deleteDataset: (content: Content<DataSource>) => boolean;
  getContentWithDataSource: () => Array<Content<DataSource>>;
  isDataNew: (data: JSONstat | TbmlData | object, dataset: DatasetRepoNode<JSONstat | TbmlData | object> | null) => boolean;
}
