import { Content } from 'enonic-types/content'
import { NodeQueryResponse, RepoNode } from 'enonic-types/node'
import { RepositoryConfig } from 'enonic-types/repo'

const {
  getRepo,
  createRepo,
  repoExists
} = __non_webpack_require__('/lib/ssb/repo/repo')
const {
  nodeExists,
  createNode,
  getNode,
  getChildNodes,
  modifyNode,
  deleteNode
} = __non_webpack_require__('/lib/ssb/repo/common')
const {
  cronJobLog
} = __non_webpack_require__('/lib/ssb/utils/serverLog')


export const BESTBET_REPO: string = 'no.ssb.bestbet'
export const BESTBET_BRANCH: string = 'master'
export const UNPUBLISHED_BESTBET_BRANCH: string = 'draft'

function createSourceNode(dataSource: string, branch: string): void {
  if (!nodeExists(BESTBET_REPO, branch, `/${dataSource}`)) {
    createNode(BESTBET_REPO, branch, {
      _parentPath: `/`,
      _name: dataSource
    })
  }
}

export function setupBestBetRepo(): void {
  if (!repoExists(BESTBET_REPO, BESTBET_BRANCH)) {
    cronJobLog(`Creating Repo: '${BESTBET_REPO}' ...`)
    createRepo(BESTBET_REPO, BESTBET_BRANCH)
  } else {
    cronJobLog('BestBet Repo found.')
  }
  cronJobLog('BestBet Repo setup complete.')
}

export function listBestBets(count?: number): NodeQueryResponse {
  return getChildNodes(BESTBET_REPO, BESTBET_BRANCH, '/', count ? count : undefined, )
}

export function createBestBet(linkedContentId: string, searchWords: Array<string>): RepoNode {
  return createNode(BESTBET_REPO, BESTBET_BRANCH, {
    linkedContentId: linkedContentId,
    searchWords: searchWords
  })
}
