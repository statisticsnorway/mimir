import { RepoNode } from '/lib/xp/node'
import { StatisticInListing, StatRegBase } from '../dashboard/statreg/types'

const { equals } = __non_webpack_require__('/lib/vendor/ramda')
const { createNode, getNode, modifyNode } = __non_webpack_require__('/lib/ssb/repo/common')
const { repoExists, createRepo } = __non_webpack_require__('/lib/ssb/repo/repo')
const { STATREG_REPO_CONTACTS_KEY, fetchContacts } = __non_webpack_require__('/lib/ssb/statreg/contacts')
const { STATREG_REPO_STATISTICS_KEY, fetchStatistics, createMimirMockReleaseStatreg } =
  __non_webpack_require__('/lib/ssb/statreg/statistics')
const { STATREG_REPO_PUBLICATIONS_KEY, fetchPublications } = __non_webpack_require__('/lib/ssb/statreg/publications')
const { STATREG_BRANCH, STATREG_REPO } = __non_webpack_require__('/lib/ssb/dashboard/statreg/config')
const { Events, logUserDataQuery } = __non_webpack_require__('/lib/ssb/repo/query')
const { ensureArray } = __non_webpack_require__('/lib/ssb/utils/arrayUtils')
const { cronJobLog } = __non_webpack_require__('/lib/ssb/utils/serverLog')

const STATREG_CONTACTS_NODE: StatRegNodeConfig = configureNode(STATREG_REPO_CONTACTS_KEY, fetchContacts)
const STATREG_STATISTICS_NODE: StatRegNodeConfig = configureNode(STATREG_REPO_STATISTICS_KEY, fetchStatistics)
const STATREG_PUBLICATIONS_NODE: StatRegNodeConfig = configureNode(STATREG_REPO_PUBLICATIONS_KEY, fetchPublications)

export const STATREG_NODES: Array<StatRegNodeConfig> = [
  STATREG_CONTACTS_NODE,
  STATREG_STATISTICS_NODE,
  STATREG_PUBLICATIONS_NODE,
]

function configureNode(key: string, fetcher: () => Array<StatRegBase> | null): StatRegNodeConfig {
  return {
    key,
    fetcher,
  }
}

export function setupStatRegRepo(): void {
  if (!repoExists(STATREG_REPO, STATREG_BRANCH)) {
    cronJobLog(`Creating Repo: '${STATREG_REPO}' ...`)
    createRepo(STATREG_REPO, STATREG_BRANCH)
  } else {
    cronJobLog('StatReg Repo found.')
  }
  cronJobLog('StatReg Repo setup complete.')
}

export function refreshStatRegData(nodeConfig: Array<StatRegNodeConfig> = STATREG_NODES): Array<StatRegRefreshResult> {
  return nodeConfig.map((statRegFetcher: StatRegNodeConfig) => {
    return setupStatRegFetcher(statRegFetcher)
  })
}

function setupStatRegFetcher(statRegFetcher: StatRegNodeConfig): StatRegRefreshResult {
  cronJobLog(`Setting up StatReg Node: '/${statRegFetcher.key}' ...`)
  const node: StatRegNode | null = getStatRegNode(statRegFetcher.key)
  try {
    logUserDataQuery(statRegFetcher.key, {
      file: '/lib/repo/statreg.ts',
      function: 'setupStatRegFetcher',
      message: Events.GET_DATA_STARTED,
    })
    const result: Array<StatRegBase> | null = statRegFetcher.fetcher()
    if (result) {
      const res: StatRegCompareResult = compareResult(node, result)
      const status: string = res.changed || res.added || res.deleted ? Events.DATASET_UPDATED : Events.NO_NEW_DATA
      if (status !== Events.NO_NEW_DATA) {
        if (node) {
          modifyStatRegNode(node._id, result)
        } else {
          createStatRegNode(statRegFetcher.key, result)
        }
      }

      logUserDataQuery(statRegFetcher.key, {
        file: '/lib/repo/statreg.ts',
        function: 'setupStatRegFetcher',
        message: status,
        result: res,
      })
      return {
        key: statRegFetcher.key,
        status,
        info: res,
      }
    } else {
      logUserDataQuery(statRegFetcher.key, {
        file: '/lib/repo/statreg.ts',
        function: 'setupStatRegFetcher',
        message: Events.FAILED_TO_GET_DATA,
      })
      return {
        key: statRegFetcher.key,
        status: Events.FAILED_TO_GET_DATA,
        info: {
          changed: 0,
          added: 0,
          deleted: 0,
          total: node && node.data ? node.data.length : 0,
        },
      }
    }
  } catch (err) {
    log.error(`Could not fetch ${statRegFetcher.key}... ${JSON.stringify(err)}`)
    logUserDataQuery(statRegFetcher.key, {
      file: '/lib/repo/statreg.ts',
      function: 'setupStatRegFetcher',
      message: Events.FAILED_TO_REFRESH_DATASET,
    })
    return {
      key: statRegFetcher.key,
      status: Events.FAILED_TO_REFRESH_DATASET,
      info: {
        changed: 0,
        added: 0,
        deleted: 0,
        total: node && node.data ? node.data.length : 0,
      },
    }
  }
}

function compareResult(node: StatRegNode | null, result: Array<StatRegBase>): StatRegCompareResult {
  let added = 0
  let deleted = 0
  let changed = 0
  let total = 0
  if (!node || !node.data) {
    added = result.length
    total = added
  } else {
    const oldResult: Array<StatRegBase> = node.data.map((o: StatisticInListing) => {
      if (o.variants) {
        return {
          ...o,
          variants: ensureArray(o.variants),
        }
      } else {
        return o
      }
    })
    result.forEach((newStatReg: StatRegBase) => {
      const oldStatReg: StatRegBase | undefined = oldResult.find((oldStatReg) => oldStatReg.id === newStatReg.id)
      if (oldStatReg) {
        if (!equals(oldStatReg, newStatReg)) {
          changed += 1
        }
      } else {
        added += 1
      }
    })
    oldResult.forEach((oldStatReg: StatRegBase) => {
      const newStatReg: StatRegBase | undefined = result.find((newStatReg) => newStatReg.id === oldStatReg.id)
      if (!newStatReg) {
        deleted += 1
      }
    })
    total = result.length
  }

  return {
    added,
    deleted,
    changed,
    total,
  }
}

function createStatRegNode(name: string, content: object): void {
  createNode(STATREG_REPO, STATREG_BRANCH, {
    _path: name,
    _name: name,
    data: content,
  })
}

export function getStatRegNode(key: string): StatRegNode | null {
  const node: StatRegNode[] = getNode(STATREG_REPO, STATREG_BRANCH, `/${key}`) as StatRegNode[]
  return Array.isArray(node) ? node[0] : node
}

function modifyStatRegNode(key: string, content: Array<StatRegBase>): StatRegNode {
  return modifyNode<StatRegNode>(STATREG_REPO, STATREG_BRANCH, key, (node) => {
    return {
      ...node,
      data: content,
    }
  })
}

export function updateMimirMockRelease(): void {
  const statisticNode: StatRegNode | null = getStatRegNode('statistics')
  const mockRelease: StatisticInListing = createMimirMockReleaseStatreg()

  if (statisticNode) {
    const statisticData: Array<StatisticInListing> = statisticNode.data.map((statistic: StatisticInListing) => {
      if (statistic.id === 0) {
        return mockRelease
      } else {
        return statistic
      }
    })

    modifyNode<StatRegNode>(STATREG_REPO, STATREG_BRANCH, statisticNode._id, (node) => {
      return {
        ...node,
        data: statisticData,
      }
    })
  }
}

export type StatRegNode = RepoNode & StatRegContent
export interface StatRegNodeConfig {
  key: string
  fetcher: () => Array<StatRegBase> | null
}

interface StatRegCompareResult {
  added: number
  deleted: number
  changed: number
  total: number
}

export interface StatRegContent {
  data: Array<StatRegBase>
  _ts: string
}

export interface StatRegRefreshResult {
  key: string
  status: string
  info: StatRegCompareResult
}

export interface StatRegRepoLib {
  setupStatRegRepo: () => void
  refreshStatRegData(nodeConfig?: Array<StatRegNodeConfig>): Array<StatRegRefreshResult>
  getStatRegNode: (key: string) => StatRegNode | null
  STATREG_NODES: Array<StatRegNodeConfig>
  updateMimirMockRelease: () => void
}
