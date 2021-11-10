import { NodeQueryHit, NodeQueryResponse, RepoNode } from 'enonic-types/node'

const {
  getRepo,
  createRepo,
  repoExists
} = __non_webpack_require__('/lib/ssb/repo/repo')
const {
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

// function createSourceNode(dataSource: string, branch: string): void {
//   if (!nodeExists(BESTBET_REPO, branch, `/${dataSource}`)) {
//     createNode(BESTBET_REPO, branch, {
//       _parentPath: `/`,
//       _name: dataSource
//     })
//   }
// }

export function setupBestBetRepo(): void {
  if (!repoExists(BESTBET_REPO, BESTBET_BRANCH)) {
    cronJobLog(`Creating Repo: '${BESTBET_REPO}' ...`)
    createRepo(BESTBET_REPO, BESTBET_BRANCH)
  } else {
    cronJobLog('BestBet Repo found.')
  }
  cronJobLog('BestBet Repo setup complete.')
}

export function listBestBets(count?: number): ReadonlyArray<RepoNode> | RepoNode | null {
  const nodes: NodeQueryResponse = getChildNodes(BESTBET_REPO, BESTBET_BRANCH, '/', count ? count : undefined, )
  const ids: Array<string> = nodes.hits.map( (hit: NodeQueryHit) => {
    return hit.id
  })
  return getNode(BESTBET_REPO, BESTBET_BRANCH, ids)
}

export function createBestBet(linkedContentId: string, searchWords: Array<string>): RepoNode {
  return createNode(BESTBET_REPO, BESTBET_BRANCH, {
    linkedContentId: linkedContentId,
    searchWords: searchWords
  })
}
