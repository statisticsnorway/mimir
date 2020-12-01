import { RepoNode } from 'enonic-types/node'
import { QueryFilters, RepoCommonLib } from './common'
import { ArrayUtilsLib } from '../ssb/arrayUtils'
import { StatRegContactsLib } from './statreg/contacts'
import { StatRegStatisticsLib } from './statreg/statistics'
import { StatRegPublicationsLib } from './statreg/publications'
import { StatRegFetchInfo,
  StatRegFetchJobNode,
  StatRegLatestFetchInfoNode,
  StatRegEventLog } from './statreg/eventLog'
import moment = require('moment')
import { RepoEventLogLib } from './eventLog'
import { RepoLib } from './repo'
import { StatRegConfigLib } from '../ssb/statreg/config'

const {
  ensureArray
}: ArrayUtilsLib = __non_webpack_require__('/lib/ssb/arrayUtils')
const {
  createNode, getNode, modifyNode, nodeExists, withLoggedInUserContext
}: RepoCommonLib = __non_webpack_require__('/lib/repo/common')
const {
  repoExists, createRepo
}: RepoLib = __non_webpack_require__('/lib/repo/repo')
const {
  createEventLog, updateEventLog, EVENT_LOG_BRANCH, EVENT_LOG_REPO
}: RepoEventLogLib = __non_webpack_require__('/lib/repo/eventLog')
const {
  StatRegFetchStatus
}: StatRegEventLog = __non_webpack_require__('/lib/repo/statreg/eventLog')
const {
  STATREG_REPO_CONTACTS_KEY, fetchContacts
}: StatRegContactsLib = __non_webpack_require__('/lib/repo/statreg/contacts')
const {
  STATREG_REPO_STATISTICS_KEY, fetchStatistics
}: StatRegStatisticsLib = __non_webpack_require__('/lib/repo/statreg/statistics')
const {
  STATREG_REPO_PUBLICATIONS_KEY, fetchPublications
}: StatRegPublicationsLib = __non_webpack_require__('/lib/repo/statreg/publications')
const {
  STATREG_BRANCH,
  STATREG_REPO
}: StatRegConfigLib = __non_webpack_require__('/lib/ssb/statreg/config')

export interface StatRegNodeConfig {
    key: string;
    fetcher: () => object;
}

export interface StatRegContent {
    content: object;
}

export type StatRegNode = RepoNode & StatRegContent;

export function createStatRegNode(name: string, content: StatRegContent): void {
  createNode(STATREG_REPO, STATREG_BRANCH, {
    _path: name,
    _name: name,
    ...content
  })
}

function getStatRegNode(key: string): StatRegNode | null {
  const node: StatRegNode[] = getNode(STATREG_REPO, STATREG_BRANCH, `/${key}`) as StatRegNode[]
  // log.info(`Retrieving Node ${key}: ${JSON.stringify(node)}`)
  return Array.isArray(node) ? node[0] : node
}

function modifyStatRegNode(key: string, content: StatRegContent): StatRegNode {
  return modifyNode<StatRegNode>(STATREG_REPO, STATREG_BRANCH, key, (node) => {
    return {
      ...node,
      ...content
    }
  })
}

function getEventRoot(eventType: string): StatRegLatestFetchInfoNode {
  const nodes: ReadonlyArray<StatRegLatestFetchInfoNode> | StatRegLatestFetchInfoNode | null =
        getNode<StatRegLatestFetchInfoNode>(
          EVENT_LOG_REPO, EVENT_LOG_BRANCH,
          `/statreg/${eventType.toLowerCase()}`
        )

  return Array.isArray(nodes) ? nodes[0] : nodes
}

// write to
function logToEventLogAndUpdateLatestInfo(key: string, fetchEvent: StatRegFetchJobNode, evtData: StatRegFetchInfo): RepoNode {
  const eventRoot: StatRegLatestFetchInfoNode = getEventRoot(key)
  const now: Date = new Date()
  updateEventLog<StatRegLatestFetchInfoNode>(eventRoot._id, (node) => {
    const {
      status, message
    } = evtData
    return {
      ...node,
      data: {
        latestEvent: fetchEvent._id,
        latestEventInfo: {
          ...fetchEvent.data,
          status,
          message,
          completionTime: now.toISOString()
        }
      }
    }
  })

  return updateEventLog<StatRegFetchJobNode>(fetchEvent._id, (node) => {
    const preamble: string = eventLogPreamble(key, now)
    return {
      ...node,
      _name: preamble,
      data: {
        ...node.data,
        ...evtData,
        completionTime: now.toISOString()
      }
    }
  })
}

export function toDisplayString(key: string): string {
  switch (key) {
  case STATREG_REPO_CONTACTS_KEY: return 'kontakter'
  case STATREG_REPO_STATISTICS_KEY: return 'statistikk'
  case STATREG_REPO_PUBLICATIONS_KEY: return 'publiseringer'
  default: return 'ukjent data'
  }
}

function setupStatRegFetcher(statRegFetcher: StatRegNodeConfig): RepoNode {
  const fetchEventNode: StatRegFetchJobNode = createStatRegEvent(statRegFetcher.key)
  log.info(`Setting up StatReg Node: '/${statRegFetcher.key}' ...`)
  const node: StatRegNode | null = getStatRegNode(statRegFetcher.key)
  try {
    const content: StatRegContent = {
      content: statRegFetcher.fetcher()
    }

    node ?
      modifyStatRegNode(node._id, content) :
      createStatRegNode(statRegFetcher.key, content)

    const message: string = content && Array.isArray(content.content) ?
      `Hentet ${(content.content as Array<object>).length} ${toDisplayString(statRegFetcher.key)}` :
      '--'

    return logToEventLogAndUpdateLatestInfo(statRegFetcher.key, fetchEventNode, {
      result: content,
      message,
      status: StatRegFetchStatus.COMPLETE_SUCCESS
    })
  } catch (err) {
    log.error(`Could not fetch ${statRegFetcher.key}... ${JSON.stringify(err)}`)
    return logToEventLogAndUpdateLatestInfo(statRegFetcher.key, fetchEventNode, {
      status: StatRegFetchStatus.COMPLETE_ERROR,
      message: `Noe gikk galt: ${err}`
    })
  }
}

function setupNodes(fetchers: Array<StatRegNodeConfig>): void {
  ensureArray(fetchers)
    .forEach((statRegFetcher: StatRegNodeConfig) => {
      setupStatRegFetcher(statRegFetcher)
    })
}

function configureNode(key: string, fetcher: (filters: QueryFilters) => unknown): StatRegNodeConfig {
  return {
    key,
    fetcher
  } as StatRegNodeConfig
}

const STATREG_CONTACTS_NODE: StatRegNodeConfig = configureNode(STATREG_REPO_CONTACTS_KEY, fetchContacts)
const STATREG_STATISTICS_NODE: StatRegNodeConfig = configureNode(STATREG_REPO_STATISTICS_KEY, fetchStatistics)
const STATREG_PUBLICATIONS_NODE: StatRegNodeConfig = configureNode(STATREG_REPO_PUBLICATIONS_KEY, fetchPublications)


export const STATREG_NODES: Array<StatRegNodeConfig> = [
  STATREG_CONTACTS_NODE,
  STATREG_STATISTICS_NODE,
  STATREG_PUBLICATIONS_NODE
]

function setupStatRegEventLog(): void {
  if (!nodeExists(EVENT_LOG_REPO, EVENT_LOG_BRANCH, '/statreg')) {
    log.info('Setting up StatReg EventLog ...')
    const root: RepoNode = createEventLog({
      _id: 'statreg',
      _path: 'statreg',
      _name: 'statreg'
    })

    // Setup nodes for each type of data we fetch from statreg
    // This provides an easier way of storing latestFetchInfo instead of "finding" the lastet event
    STATREG_NODES.forEach((cfg: StatRegNodeConfig) => {
      log.info(`Creating ${cfg.key}-specific mount point under ${root._id}:${root._childOrder}`)
      createEventLog({
        _id: cfg.key,
        _path: cfg.key,
        _parentPath: '/statreg',
        _name: cfg.key
      })
    })
  } else {
    log.info('StatReg EventLog found.')
  }
}

const EVENT_LOG_PREAMBLE_TIME_FMT: string = 'DD.MM.YYYY HH:mm:ss'

function eventLogPreamble(key: string, eventTime: Date): string {
  return moment(eventTime).format(EVENT_LOG_PREAMBLE_TIME_FMT)
}

function createStatRegEvent(key: string): StatRegFetchJobNode {
  return withLoggedInUserContext(EVENT_LOG_BRANCH, (user) => {
    const now: Date = new Date()
    const preamble: string = eventLogPreamble(key, now)
    return createEventLog({
      _parentPath: `/statreg/${key}`,
      _name: preamble,
      data: {
        message: preamble,
        startTime: now.toISOString(),
        status: StatRegFetchStatus.INIT,
        user
      }
    })
  })
}

export function setupStatRegRepo(): void {
  if (!repoExists(STATREG_REPO, STATREG_BRANCH)) {
    log.info(`Creating Repo: '${STATREG_REPO}' ...`)
    createRepo(STATREG_REPO, STATREG_BRANCH)
  } else {
    log.info('StatReg Repo found.')
  }

  setupStatRegEventLog()
  log.info('StatReg Repo setup complete.')
}

export function fetchStatRegData(nodeConfig: Array<StatRegNodeConfig> = STATREG_NODES): void {
  setupNodes(nodeConfig)
}

export interface StatRegRepoLib {
  toDisplayString: (key: string) => string;
  STATREG_NODES: Array<StatRegNodeConfig>;
  setupStatRegRepo: () => void;
  fetchStatRegData(nodeConfig?: Array<StatRegNodeConfig>): void;
}
