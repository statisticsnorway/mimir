import { RepoNode } from 'enonic-types/lib/node'
import { repoExists, createRepo } from './repo'
import { QueryFilters, createNode, getNode, modifyNode } from './common'
import { ensureArray } from '../ssb/arrayUtils'
import { STATREG_REPO_CONTACTS_KEY, fetchContacts } from './statreg/contacts'
import { STATREG_REPO_STATISTICS_KEY, fetchStatistics } from './statreg/statistics'
import { STATREG_REPO_PUBLICATIONS_KEY, fetchPublications } from './statreg/publications'

export const STATREG_REPO: string = 'no.ssb.statreg'
export const STATREG_BRANCH: string = 'master'

export interface StatRegNodeConfig {
    key: string;
    fetcher: () => any;
}

export interface StatRegContent {
    content: object;
}

export type StatRegNode = RepoNode & StatRegContent;

export function createStatRegNode(name: string, content: StatRegContent) {
  createNode(STATREG_REPO, STATREG_BRANCH, {
    _path: name,
    _name: name,
    ...content
  })
}

export function getStatRegNode(key: string): StatRegNode | null {
  const node: StatRegNode[] = getNode(STATREG_REPO, STATREG_BRANCH, `/${key}`) as StatRegNode[]
  // log.info(`Retrieving Node ${key}: ${JSON.stringify(node)}`)
  return Array.isArray(node) ? node[0] : node
}

export function modifyStatRegNode(key: string, content: StatRegContent): StatRegNode {
  return modifyNode<StatRegNode>(STATREG_REPO, STATREG_BRANCH, key, (node) => {
    return {
      ...node,
      ...content
    }
  })
}

function setupNodes(fetchers: Array<StatRegNodeConfig>) {
  ensureArray(fetchers)
    .forEach((statRegFetcher) => {
      log.info(`Setting up StatReg Node: '/${statRegFetcher.key}' ...`)
      const node: StatRegNode | null = getStatRegNode(statRegFetcher.key)
      const content: StatRegContent = {
        content: statRegFetcher.fetcher()
      }

      node ?
        modifyStatRegNode(node._id, content) :
        createStatRegNode(statRegFetcher.key, content)
    })
}

export function configureNode(key: string, fetcher: (filters: QueryFilters) => any): StatRegNodeConfig {
  return {
    key,
    fetcher
  } as StatRegNodeConfig
}

const STATREG_NODES: Array<StatRegNodeConfig> = [
  configureNode(STATREG_REPO_CONTACTS_KEY, fetchContacts),
  configureNode(STATREG_REPO_STATISTICS_KEY, fetchStatistics),
  configureNode(STATREG_REPO_PUBLICATIONS_KEY, fetchPublications)
]

export function setupStatRegRepo(nodeConfig: Array<StatRegNodeConfig> = STATREG_NODES) {
  if (!repoExists(STATREG_REPO, STATREG_BRANCH)) {
    log.info(`Creating Repo: '${STATREG_REPO}' ...`)
    createRepo(STATREG_REPO, STATREG_BRANCH)
  } else {
    log.info('StatReg Repo found.')
  }

  setupNodes(nodeConfig)
  log.info('StatReg Repo setup complete.')
}

