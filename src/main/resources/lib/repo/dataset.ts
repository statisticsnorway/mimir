import { RepoCommonLib, deleteNode } from './common'
import { RepoNode } from 'enonic-types/lib/node'

const {
  repoExists,
  createRepo
} = __non_webpack_require__('/lib/repo/repo')
const {
  nodeExists,
  createNode,
  getNode,
  modifyNode
}: RepoCommonLib = __non_webpack_require__('/lib/repo/common')

export const DATASET_REPO: string = 'no.ssb.dataset'
export const DATASET_BRANCH: string = 'master'

export enum DataSource {
  STATBANK_API = 'statbank-api',
  TALLBYGGER = 'tallbygger',
  STATBANK_SAVED = 'statbank-saved',
  DATASET = 'dataset',
  KLASS = 'klass',
}

export function setupDatasetRepo(): void {
  if (!datasetRepoExists()) {
    createRepo(DATASET_REPO, DATASET_BRANCH)
  }
  createSourceNode(DataSource.STATBANK_API)
  createSourceNode(DataSource.TALLBYGGER)
  createSourceNode(DataSource.STATBANK_SAVED)
  createSourceNode(DataSource.DATASET)
  createSourceNode(DataSource.KLASS)
}

function datasetRepoExists(): boolean {
  return repoExists(DATASET_REPO, DATASET_BRANCH)
}

function createSourceNode(dataSource: string): void {
  if (!nodeExists(DATASET_REPO, DATASET_BRANCH, `/${dataSource}`)) {
    createNode(DATASET_REPO, DATASET_BRANCH, `/${dataSource}`)
  }
}

export function getDataset<T>(dataSourceType: string, id: string): DatasetRepoNode<T> | undefined {
  return getNode(DATASET_REPO, DATASET_BRANCH, `/${dataSourceType}/${id}`)[0]
}

export function createOrUpdateDataset<T>(dataSourceType: string, id: string, data: T): DatasetRepoNode<T> {
  if (!nodeExists(DATASET_REPO, DATASET_BRANCH, `/${dataSourceType}/${id}`)) {
    return createNode(DATASET_REPO, DATASET_BRANCH, data)
  } else {
    return modifyNode(DATASET_REPO, DATASET_BRANCH, `/${dataSourceType}/${id}`, (dataset) => {
      dataset.data = data
      return dataset
    })
  }
}

export function deleteDataset(dataSourceType: string, id: string): boolean {
  return deleteNode(DATASET_REPO, DATASET_BRANCH, `/${dataSourceType}/${id}`)
}

export interface DatasetRepoNode<T> extends RepoNode {
  data?: T;
}
