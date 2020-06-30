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

export enum DataSource {
  STATBANK_API = 'statbankApi',
  TBPROCESSOR = 'tbprocessor',
  STATBANK_SAVED = 'statbankSaved',
  DATASET = 'dataset',
  KLASS = 'klass',
}

export function setupDatasetRepo(): void {
  if (!datasetRepoExists()) {
    createRepo(DATASET_REPO, DATASET_BRANCH)
  }
  createSourceNode(DataSource.STATBANK_API)
  createSourceNode(DataSource.TBPROCESSOR)
  createSourceNode(DataSource.STATBANK_SAVED)
  createSourceNode(DataSource.DATASET)
  createSourceNode(DataSource.KLASS)
}

function datasetRepoExists(): boolean {
  return repoExists(DATASET_REPO, DATASET_BRANCH)
}

function createSourceNode(dataSource: string): void {
  if (!nodeExists(DATASET_REPO, DATASET_BRANCH, `/${dataSource}`)) {
    createNode(DATASET_REPO, DATASET_BRANCH, {
      _parentPath: `/`,
      _name: dataSource
    })
  }
}

export function getDataset<T>(dataSourceType: string, key: string): DatasetRepoNode<T> | null {
  const res: readonly DatasetRepoNode<T>[] | DatasetRepoNode<T> | null = getNode(DATASET_REPO, DATASET_BRANCH, `/${dataSourceType}/${key}`)
  if (Array.isArray(res)) {
    return res[0]
  } else {
    return res as DatasetRepoNode<T> | null
  }
}

export function createOrUpdateDataset<T>(dataSourceType: string, key: string, data: T): DatasetRepoNode<T> {
  if (!nodeExists(DATASET_REPO, DATASET_BRANCH, `/${dataSourceType}/${key}`)) {
    return createNode(DATASET_REPO, DATASET_BRANCH, {
      _name: key,
      _parentPath: `/${dataSourceType}`,
      data: data
    })
  } else {
    return modifyNode(DATASET_REPO, DATASET_BRANCH, `/${dataSourceType}/${key}`, (dataset) => {
      dataset.data = data
      return dataset
    })
  }
}

export function deleteDataset(dataSourceType: string, key: string): boolean {
  return deleteNode(DATASET_REPO, DATASET_BRANCH, `/${dataSourceType}/${key}`)
}

export interface DatasetRepoNode<T> extends RepoNode {
  data?: T;
}

export interface RepoDatasetLib {
  DATASET_REPO: string;
  DATASET_BRANCH: string;
  setupDatasetRepo: () => void;
  getDataset: <T>(dataSourceType: string, key: string) => DatasetRepoNode<T> | null;
  createOrUpdateDataset: <T>(dataSourceType: string, key: string, data: T) => DatasetRepoNode<T>;
  deleteDataset: (dataSourceType: string, key: string) => boolean;
}
