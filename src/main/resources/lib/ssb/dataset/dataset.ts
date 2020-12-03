import { ContentLibrary, Content, QueryResponse } from 'enonic-types/content'
import { DataSource } from '../../../site/mixins/dataSource/dataSource'
import { DataSource as DataSourceType, DatasetRepoNode, RepoDatasetLib } from '../../repo/dataset'
import { StatbankApiLib } from './statbankApi'
import { JSONstat } from '../../types/jsonstat-toolkit'
import { RepoQueryLib } from '../../repo/query'
import { TbmlData } from '../../types/xmlParser'
import { TbprocessorLib } from './tbprocessor'
import { KlassLib } from './klass'
import { ContextLibrary, RunContext } from 'enonic-types/context'
import { AuthLibrary, User } from 'enonic-types/auth'
import { StatbankSavedLib } from './statbankSaved'

const {
  Events
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
  deleteDataset: deleteDatasetFromRepo,
  DATASET_BRANCH
}: RepoDatasetLib = __non_webpack_require__('/lib/repo/dataset')

export function getDataset(content: Content<DataSource>, branch: string = DATASET_BRANCH): DatasetRepoNode<JSONstat | TbmlData | object> | null {
  switch (content.data.dataSource?._selected) {
  case DataSourceType.STATBANK_API: {
    return getStatbankApi(content, branch)
  }
  case DataSourceType.TBPROCESSOR: {
    return getTbprocessor(content, branch)
  }
  case DataSourceType.KLASS: {
    return getKlass(content, branch)
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
    const language: string = content.language || ''
    return `${getTbprocessorKey(content)}${language === 'en' ? language : ''}`
  case DataSourceType.STATBANK_SAVED:
    return getStatbankApiKey(content)
  case DataSourceType.KLASS:
    return getKlassKey(content)
  default:
    return null
  }
}

function fetchData(content: Content<DataSource>, processXml?: string): JSONstat | TbmlData | object | null {
  switch (content.data.dataSource?._selected) {
  case DataSourceType.STATBANK_API:
    return fetchStatbankApiData(content)
  case DataSourceType.TBPROCESSOR:
    return fetchTbprocessorData(content, processXml)
  case DataSourceType.STATBANK_SAVED:
    return fetchStatbankSavedData(content)
  case DataSourceType.KLASS:
    return fetchKlassData(content)
  default:
    return null
  }
}

export function refreshDataset(
  content: Content<DataSource>,
  branch: string = DATASET_BRANCH,
  processXml?: string ): CreateOrUpdateStatus {
  /**/
  const data: JSONstat | TbmlData | object | null = fetchData(content, processXml)
  log.info('datafrom fetchdata')
  log.info(JSON.stringify(data, null, 2))
  const key: string | null = extractKey(content)
  const user: User | null = getUser()

  if (data && content.data.dataSource && content.data.dataSource._selected && key) {
    let dataset: DatasetRepoNode<JSONstat | TbmlData | object> | null = getDataset(content, branch)
    const hasNewData: boolean = isDataNew(data, dataset)
    if (!dataset || hasNewData) {
      dataset = createOrUpdateDataset(content.data.dataSource?._selected, branch, key, data)
    }
    return {
      dataquery: content,
      status: !hasNewData ? Events.NO_NEW_DATA : Events.GET_DATA_COMPLETE,
      newDatasetData: hasNewData,
      dataset,
      user
    }
  } else {
    return {
      dataquery: content,
      status: Events.FAILED_TO_GET_DATA,
      dataset: null,
      newDatasetData: false,
      user
    }
  }
}

export function refreshDatasetWithUserKey(content: Content<DataSource>, userLogin: string, branch: string = DATASET_BRANCH, ): CreateOrUpdateStatus {
  const context: RunContext = {
    branch: 'master',
    repository: 'com.enonic.cms.default',
    principals: ['role:system.admin'],
    user: {
      login: userLogin,
      idProvider: 'system'
    }
  }
  return run(context, () => refreshDataset(content, branch))
}


export function deleteDataset(content: Content<DataSource>, branch: string = DATASET_BRANCH): boolean {
  const key: string | null = extractKey(content)
  if (content.data.dataSource && content.data.dataSource._selected && key) {
    return deleteDatasetFromRepo(content.data.dataSource._selected, branch, key)
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
  getDataset: (content: Content<DataSource>, branch?: string) => DatasetRepoNode<JSONstat | TbmlData | object> | null;
  extractKey: (content: Content<DataSource>) => string;
  refreshDataset: (content: Content<DataSource>, branch?: string, processXml?: string) => CreateOrUpdateStatus;
  refreshDatasetWithUserKey: (content: Content<DataSource>, userLogin: string, branch?: string) => CreateOrUpdateStatus;
  deleteDataset: (content: Content<DataSource>, branch?: string) => boolean;
  getContentWithDataSource: () => Array<Content<DataSource>>;
  isDataNew: (data: JSONstat | TbmlData | object, dataset: DatasetRepoNode<JSONstat | TbmlData | object> | null) => boolean;
}
