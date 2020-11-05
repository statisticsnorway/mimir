import { RepoCommonLib } from './common'
import { RepoNode } from 'enonic-types/node'
import { RepoLib } from './repo'
import { RepositoryConfig } from 'enonic-types/repo'

const {
  getRepo,
  createRepo,
  createBranch
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

export function setupDatasetRepo(): void {
  let repo: RepositoryConfig | null = getRepo(DATASET_REPO, DATASET_BRANCH)
  if (!repo) {
    repo = createRepo(DATASET_REPO, DATASET_REPO)
  }
  if (repo.branches.indexOf(DATASET_BRANCH) < 0) {
    createBranch(DATASET_REPO, DATASET_BRANCH)
  }
  if (repo.branches.indexOf(UNPUBLISHED_DATASET_BRANCH) < 0) {
    createBranch(DATASET_REPO, UNPUBLISHED_DATASET_BRANCH)
  }
  createSourceNode(DataSource.STATBANK_API, DATASET_BRANCH)
  createSourceNode(DataSource.STATBANK_API, UNPUBLISHED_DATASET_BRANCH)
  createSourceNode(DataSource.TBPROCESSOR, DATASET_BRANCH)
  createSourceNode(DataSource.TBPROCESSOR, UNPUBLISHED_DATASET_BRANCH)
  createSourceNode(DataSource.STATBANK_SAVED, DATASET_BRANCH)
  createSourceNode(DataSource.STATBANK_SAVED, UNPUBLISHED_DATASET_BRANCH)
  createSourceNode(DataSource.DATASET, DATASET_BRANCH)
  createSourceNode(DataSource.DATASET, UNPUBLISHED_DATASET_BRANCH)
  createSourceNode(DataSource.KLASS, DATASET_BRANCH)
  createSourceNode(DataSource.KLASS, UNPUBLISHED_DATASET_BRANCH)
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
  _name: string;
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
