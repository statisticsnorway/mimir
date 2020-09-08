import { RepoNode } from 'enonic-types/lib/node'
import { repoExists, createRepo } from './repo'
import { QueryFilters, createNode, getNode, modifyNode, nodeExists, withLoggedInUserContext } from './common'
import { ensureArray } from '../ssb/arrayUtils'
import { STATREG_REPO_CONTACTS_KEY, fetchContacts } from './statreg/contacts'
import { STATREG_REPO_STATISTICS_KEY, fetchStatistics } from './statreg/statistics'
import { STATREG_REPO_PUBLICATIONS_KEY, fetchPublications } from './statreg/publications'
import { createEventLog, EVENT_LOG_BRANCH, EVENT_LOG_REPO, updateEventLog } from './eventLog'
import { StatRegFetchInfo,
  StatRegFetchJobNode,
  StatRegFetchStatus,
  StatRegLatestFetchInfoNode } from './statreg/eventLog'
import moment = require('moment')

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

export function createStatRegNode(name: string, content: StatRegContent): void{
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

function getEventRoot(eventType: string): StatRegLatestFetchInfoNode {
  const nodes: ReadonlyArray<StatRegLatestFetchInfoNode> | StatRegLatestFetchInfoNode | null =
        getNode<StatRegLatestFetchInfoNode>(
          EVENT_LOG_REPO, EVENT_LOG_BRANCH,
          `/statreg/${eventType.toLowerCase()}`
        )

  return Array.isArray(nodes) ? nodes[0] : nodes
}

// write to
function logToEventLogAndUpdateLatestInfo(key: string, fetchEvent: StatRegFetchJobNode, evtData: StatRegFetchInfo) {
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
    const preamble: string = eventLogPreamble(key, now, evtData.status)
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

function toDisplayString(key: string): string {
  switch (key) {
  case STATREG_REPO_CONTACTS_KEY: return 'kontakter'
  case STATREG_REPO_STATISTICS_KEY: return 'statistikk'
  case STATREG_REPO_PUBLICATIONS_KEY: return 'publiseringer'
  default: return 'ukjent data'
  }
}

function setupStatRegFetcher(statRegFetcher: StatRegNodeConfig) {
  const fetchEventNode: StatRegFetchJobNode = createStatRegEvent(statRegFetcher.key, `Fetching ${statRegFetcher.key} ...`)
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

function setupNodes(fetchers: Array<StatRegNodeConfig>) {
  ensureArray(fetchers)
    .forEach((statRegFetcher: StatRegNodeConfig) => {
      setupStatRegFetcher(statRegFetcher)
    })
}

export function configureNode(key: string, fetcher: (filters: QueryFilters) => any): StatRegNodeConfig {
  return {
    key,
    fetcher
  } as StatRegNodeConfig
}

export const STATREG_CONTACTS_NODE: StatRegNodeConfig = configureNode(STATREG_REPO_CONTACTS_KEY, fetchContacts)
export const STATREG_STATISTICS_NODE: StatRegNodeConfig = configureNode(STATREG_REPO_STATISTICS_KEY, fetchStatistics)
export const STATREG_PUBLICATIONS_NODE: StatRegNodeConfig = configureNode(STATREG_REPO_PUBLICATIONS_KEY, fetchPublications)


export const STATREG_NODES: Array<StatRegNodeConfig> = [
  STATREG_CONTACTS_NODE,
  STATREG_STATISTICS_NODE,
  STATREG_PUBLICATIONS_NODE
]

export function setupStatRegEventLog() {
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

// It will be nice to show status in the name itself - but looks like
// it is not directly possible to do so in XP Node API
// for now using just the time
//
// return `${moment(eventTime).format(EVENT_LOG_PREAMBLE_TIME_FMT)} - ${status}`
export function eventLogPreamble(key: string, eventTime: Date, status: StatRegFetchStatus): string {
  return moment(eventTime).format(EVENT_LOG_PREAMBLE_TIME_FMT)
}

export function createStatRegEvent(key: string, name?: string): StatRegFetchJobNode {
  return withLoggedInUserContext(EVENT_LOG_BRANCH, (user) => {
    const now: Date = new Date()
    const preamble: string = eventLogPreamble(key, now, StatRegFetchStatus.INIT)
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

export function setupStatRegRepo(nodeConfig: Array<StatRegNodeConfig> = STATREG_NODES) {
  if (!repoExists(STATREG_REPO, STATREG_BRANCH)) {
    log.info(`Creating Repo: '${STATREG_REPO}' ...`)
    createRepo(STATREG_REPO, STATREG_BRANCH)
  } else {
    log.info('StatReg Repo found.')
  }

  setupStatRegEventLog()
  setupNodes(nodeConfig)
  log.info('StatReg Repo setup complete.')
}

export type StatRegLatestFetchInfoNodeType = StatRegLatestFetchInfoNode | readonly StatRegLatestFetchInfoNode[] | null;

export function getStatRegFetchStatuses(): object {
  return [
    STATREG_REPO_CONTACTS_KEY,
    STATREG_REPO_STATISTICS_KEY,
    STATREG_REPO_PUBLICATIONS_KEY
  ].reduce((acc, key) => {
    const eventLogKey: string = `/statreg/${key}`
    const eventLogNodeResult: StatRegLatestFetchInfoNodeType = getNode<StatRegLatestFetchInfoNode>(EVENT_LOG_REPO, EVENT_LOG_BRANCH, eventLogKey)
    const eventLogNode: StatRegLatestFetchInfoNode = eventLogNodeResult && (Array.isArray(eventLogNodeResult) ? eventLogNodeResult[0] : eventLogNodeResult)

    return {
      ...acc,
      [key]: eventLogNode ? eventLogNode.data.latestEventInfo : {}
    }
  }, {})
}
