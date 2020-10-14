import { RepoCommonLib } from './common'
import { RepoNode } from 'enonic-types/lib/node'
import { RepoLib } from './repo'

const {
  repoExists,
  createRepo
}: RepoLib = __non_webpack_require__('/lib/repo/repo')
const {
  nodeExists,
  createNode,
  getNode,
  modifyNode,
  deleteNode
}: RepoCommonLib = __non_webpack_require__('/lib/repo/common')

export const DATASET_REPO: string = 'no.ssb.dataset'
export const DATASET_BRANCH: string = 'master'
export const UNPUBLISHED_DATASET_BRANCH: string = 'draft'

export enum DataSource {
  STATBANK_API = 'statbankApi',
  TBPROCESSOR = 'tbprocessor',
  STATBANK_SAVED = 'statbankSaved',
  DATASET = 'dataset',
  KLASS = 'klass',
  HTMLTABLE = 'htmlTable'
}

export function setupDatasetRepo(branch: string): void {
  if (!datasetRepoExists(branch)) {
    createRepo(DATASET_REPO, branch)
  }
  createSourceNode(DataSource.STATBANK_API, branch)
  createSourceNode(DataSource.TBPROCESSOR, branch)
  createSourceNode(DataSource.STATBANK_SAVED, branch)
  createSourceNode(DataSource.DATASET, branch)
  createSourceNode(DataSource.KLASS, branch)
}

function datasetRepoExists(branch: string): boolean {
  return repoExists(DATASET_REPO, branch)
}

function createSourceNode(dataSource: string, branch: string): void {
  if (!nodeExists(DATASET_REPO, branch, `/${dataSource}`)) {
    createNode(DATASET_REPO, branch, {
      _parentPath: `/`,
      _name: dataSource
    })
  }
}

export function getDataset<T>(dataSourceType: string, branch: string, key: string): DatasetRepoNode<T> | null {
  const res: readonly DatasetRepoNode<T>[] | DatasetRepoNode<T> | null = getNode(DATASET_REPO, branch, `/${dataSourceType}/${key}`)
  let dataset: DatasetRepoNode<T> | null = null
  if (Array.isArray(res)) {
    dataset = res[0]
  } else {
    dataset = res as DatasetRepoNode<T> | null
  }

  if (dataset && dataset.data && typeof(dataset.data) === 'string') {
    try {
      dataset.data = JSON.parse(dataset.data)
    } catch (e) {
      // not json-string in data, so let's ignore it
    }
  }

  return dataset
}

export function createOrUpdateDataset<T>(dataSourceType: string, branch: string, key: string, data: T): DatasetRepoNode<T> {
  if (!nodeExists(DATASET_REPO, branch, `/${dataSourceType}/${key}`)) {
    return createNode(DATASET_REPO, branch, {
      _name: key,
      _parentPath: `/${dataSourceType}`,
      data: prepareData(dataSourceType, data)
    })
  } else {
    return modifyNode(DATASET_REPO, branch, `/${dataSourceType}/${key}`, (dataset) => {
      dataset.data = JSON.stringify(data, null, 0)
      return dataset
    })
  }
}

function prepareData<T>(dataSourceType: string, data: T): T | string {
  return dataSourceType === DataSource.STATBANK_SAVED ? data : JSON.stringify(data, null, 0)
}

export function deleteDataset(dataSourceType: string, branch: string, key: string): boolean {
  return deleteNode(DATASET_REPO, branch, `/${dataSourceType}/${key}`)
}

export interface DatasetRepoNode<T> extends RepoNode {
  data?: string | T;
  _ts?: string;
}

export interface RepoDatasetLib {
  DATASET_REPO: string;
  DATASET_BRANCH: string;
  UNPUBLISHED_DATASET_BRANCH: string;
  setupDatasetRepo: (branch: string) => void;
  getDataset: <T>(dataSourceType: string, branch: string, key: string) => DatasetRepoNode<T> | null;
  createOrUpdateDataset: <T>(dataSourceType: string, branch: string, key: string, data: T) => DatasetRepoNode<T>;
  deleteDataset: (dataSourceType: string, branch: string, key: string) => boolean;
}
