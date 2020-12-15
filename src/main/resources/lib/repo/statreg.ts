import { RepoNode } from 'enonic-types/node'
import { RepoCommonLib } from './common'
import { StatRegContactsLib } from './statreg/contacts'
import { StatRegStatisticsLib } from './statreg/statistics'
import { StatRegPublicationsLib } from './statreg/publications'
import { RepoLib } from './repo'
import { StatRegConfigLib } from '../ssb/statreg/config'
import { RepoQueryLib } from './query'
import { StatRegBase } from '../ssb/statreg/types'
import { equals } from 'ramda'

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
const {
  Events,
  logUserDataQuery
}: RepoQueryLib = __non_webpack_require__('/lib/repo/query')

const STATREG_CONTACTS_NODE: StatRegNodeConfig = configureNode(STATREG_REPO_CONTACTS_KEY, fetchContacts)
const STATREG_STATISTICS_NODE: StatRegNodeConfig = configureNode(STATREG_REPO_STATISTICS_KEY, fetchStatistics)
const STATREG_PUBLICATIONS_NODE: StatRegNodeConfig = configureNode(STATREG_REPO_PUBLICATIONS_KEY, fetchPublications)

export const STATREG_NODES: Array<StatRegNodeConfig> = [
  STATREG_CONTACTS_NODE,
  STATREG_STATISTICS_NODE,
  STATREG_PUBLICATIONS_NODE
]

function configureNode(key: string, fetcher: () => Array<StatRegBase> | null): StatRegNodeConfig {
  return {
    key,
    fetcher
  }
}

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

function setupStatRegFetcher(statRegFetcher: StatRegNodeConfig): void {
  log.info(`Setting up StatReg Node: '/${statRegFetcher.key}' ...`)
  const node: StatRegNode | null = getStatRegNode(statRegFetcher.key)
  try {
    logUserDataQuery(statRegFetcher.key, {
      file: '/lib/repo/statreg.ts',
      function: 'setupStatRegFetcher',
      message: Events.GET_DATA_STARTED
    })
    const result: Array<StatRegBase> | null = statRegFetcher.fetcher()
    if (result) {
      if (node) {
        modifyStatRegNode(node._id, result)
      } else {
        createStatRegNode(statRegFetcher.key, result)
      }
      const {
        changed,
        added,
        deleted
      } = compareResult(node, result)

      let message: string = Events.NO_NEW_DATA
      message =
        `Import of ${statRegFetcher.key} complete - ${changed} changed, ${added} added, ${deleted} deleted, ${result.length - added - changed} ignored`

      logUserDataQuery(statRegFetcher.key, {
        file: '/lib/repo/statreg.ts',
        function: 'setupStatRegFetcher',
        message
      })
    } else {
      logUserDataQuery(statRegFetcher.key, {
        file: '/lib/repo/statreg.ts',
        function: 'setupStatRegFetcher',
        message: Events.FAILED_TO_GET_DATA
      })
    }
  } catch (err) {
    log.error(`Could not fetch ${statRegFetcher.key}... ${JSON.stringify(err)}`)
  }
}

function compareResult(node: StatRegNode | null, result: Array<StatRegBase>): StatRegCompareResult {
  let added: number = 0
  let deleted: number = 0
  let changed: number = 0
  if (!node) {
    added = result.length
  } else {
    result.forEach((newStatReg: StatRegBase) => {
      const oldStatReg: StatRegBase | undefined = node.data.find((oldStatReg) => oldStatReg.id === newStatReg.id)
      if (oldStatReg) {
        if (!equals(oldStatReg, newStatReg)) {
          changed += 1
        }
      } else {
        added += 1
      }
    })
    node.data.forEach((oldStatReg: StatRegBase) => {
      const newStatReg: StatRegBase | undefined = result.find((newStatReg) => newStatReg.id === oldStatReg.id)
      if (!newStatReg) {
        deleted += 1
      }
    })
  }

  return {
    added,
    deleted,
    changed
  }
}

function createStatRegNode(name: string, content: object): void {
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

function modifyStatRegNode(key: string, content: Array<StatRegBase>): StatRegNode {
  return modifyNode<StatRegNode>(STATREG_REPO, STATREG_BRANCH, key, (node) => {
    return {
      ...node,
      data: content
    }
  })
}

export type StatRegNode = RepoNode & StatRegContent;
export interface StatRegNodeConfig {
  key: string;
  fetcher: () => Array<StatRegBase> | null;
}

interface StatRegCompareResult {
  added: number;
  deleted: number;
  changed: number;
}

export interface StatRegContent {
  data: Array<StatRegBase>;
}

export interface StatRegRepoLib {
  setupStatRegRepo: () => void;
  fetchStatRegData(nodeConfig?: Array<StatRegNodeConfig>): void;
  STATREG_NODES: Array<StatRegNodeConfig>;
}
