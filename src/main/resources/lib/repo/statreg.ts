import { RepoNode } from 'enonic-types/node'
import { RepoCommonLib } from './common'
import { StatRegContactsLib } from './statreg/contacts'
import { StatRegStatisticsLib } from './statreg/statistics'
import { StatRegPublicationsLib } from './statreg/publications'
import { RepoLib } from './repo'
import { StatRegConfigLib } from '../ssb/statreg/config'
import { Events, logUserDataQuery } from './query'
import { Contact, Publication, StatisticInListing } from '../ssb/statreg/types'

const {
  createNode,
  getNode,
  modifyNode
}: RepoCommonLib = __non_webpack_require__('/lib/repo/common')
const {
  repoExists,
  createRepo
}: RepoLib = __non_webpack_require__('/lib/repo/repo')
const {
  STATREG_REPO_CONTACTS_KEY,
  fetchContacts
}: StatRegContactsLib = __non_webpack_require__('/lib/repo/statreg/contacts')
const {
  STATREG_REPO_STATISTICS_KEY,
  fetchStatistics
}: StatRegStatisticsLib = __non_webpack_require__('/lib/repo/statreg/statistics')
const {
  STATREG_REPO_PUBLICATIONS_KEY,
  fetchPublications
}: StatRegPublicationsLib = __non_webpack_require__('/lib/repo/statreg/publications')
const {
  STATREG_BRANCH,
  STATREG_REPO
}: StatRegConfigLib = __non_webpack_require__('/lib/ssb/statreg/config')

export interface StatRegNodeConfig {
  key: string;
  fetcher: () => StatRegFetchResult;
}

export interface StatRegFetchResult {
  content: Array<Contact> | Array<StatisticInListing> | Array<Publication> | null;
  status: string;
}

export interface StatRegContent {
  data: Array<Contact> | Array<StatisticInListing> | Array<Publication>;
}

export type StatRegNode = RepoNode & StatRegContent;

export function createStatRegNode(name: string, content: object): void {
  createNode(STATREG_REPO, STATREG_BRANCH, {
    _path: name,
    _name: name,
    data: content
  })
}

function getStatRegNode(key: string): StatRegNode | null {
  const node: StatRegNode[] = getNode(STATREG_REPO, STATREG_BRANCH, `/${key}`) as StatRegNode[]
  return Array.isArray(node) ? node[0] : node
}

function modifyStatRegNode(key: string, content: Array<Contact> | Array<StatisticInListing> | Array<Publication>): StatRegNode {
  return modifyNode<StatRegNode>(STATREG_REPO, STATREG_BRANCH, key, (node) => {
    return {
      ...node,
      data: content
    }
  })
}

export function toDisplayString(key: string): string {
  switch (key) {
  case STATREG_REPO_CONTACTS_KEY: return 'kontakter'
  case STATREG_REPO_STATISTICS_KEY: return 'statistikk'
  case STATREG_REPO_PUBLICATIONS_KEY: return 'publiseringer'
  default: return key
  }
}

function setupStatRegFetcher(statRegFetcher: StatRegNodeConfig): void {
  log.info(`Setting up StatReg Node: '/${statRegFetcher.key}' ...`)
  const node: StatRegNode | null = getStatRegNode(statRegFetcher.key)
  try {
    logUserDataQuery(statRegFetcher.key, {
      file: '/lib/repo/statreg.ts',
      function: 'setupStatRegFetcher',
      message: Events.GET_DATA_STARTED
    })
    const result: StatRegFetchResult = statRegFetcher.fetcher()

    if (result.content) {
      if (node) {
        modifyStatRegNode(node._id, result.content)
      } else {
        createStatRegNode(statRegFetcher.key, result.content)
      }
    } else {
      // TODO Log error
    }
  } catch (err) {
    log.error(`Could not fetch ${statRegFetcher.key}... ${JSON.stringify(err)}`)
  }
}

function configureNode(key: string, fetcher: () => StatRegFetchResult): StatRegNodeConfig {
  return {
    key,
    fetcher
  }
}

const STATREG_CONTACTS_NODE: StatRegNodeConfig = configureNode(STATREG_REPO_CONTACTS_KEY, fetchContacts)
const STATREG_STATISTICS_NODE: StatRegNodeConfig = configureNode(STATREG_REPO_STATISTICS_KEY, fetchStatistics)
const STATREG_PUBLICATIONS_NODE: StatRegNodeConfig = configureNode(STATREG_REPO_PUBLICATIONS_KEY, fetchPublications)


export const STATREG_NODES: Array<StatRegNodeConfig> = [
  STATREG_CONTACTS_NODE,
  STATREG_STATISTICS_NODE,
  STATREG_PUBLICATIONS_NODE
]

export function setupStatRegRepo(): void {
  if (!repoExists(STATREG_REPO, STATREG_BRANCH)) {
    log.info(`Creating Repo: '${STATREG_REPO}' ...`)
    createRepo(STATREG_REPO, STATREG_BRANCH)
  } else {
    log.info('StatReg Repo found.')
  }
  log.info('StatReg Repo setup complete.')
}

export function fetchStatRegData(nodeConfig: Array<StatRegNodeConfig> = STATREG_NODES): void {
  nodeConfig.forEach((statRegFetcher: StatRegNodeConfig) => {
    setupStatRegFetcher(statRegFetcher)
  })
}

export interface StatRegRepoLib {
  toDisplayString: (key: string) => string;
  STATREG_NODES: Array<StatRegNodeConfig>;
  setupStatRegRepo: () => void;
  fetchStatRegData(nodeConfig?: Array<StatRegNodeConfig>): void;
}
