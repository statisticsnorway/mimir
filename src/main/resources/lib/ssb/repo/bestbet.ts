import { NodeQueryHit, NodeQueryResponse, RepoNode } from 'enonic-types/node'

const {
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

function getBestBetData(bestBetContent: BestBetContent): BestBetContent {
  return {
    linkedSelectedContentResult: bestBetContent.linkedSelectedContentResult,
    linkedContentTitle: bestBetContent.linkedContentTitle,
    linkedContentHref: bestBetContent.linkedContentHref,
    linkedContentIngress: bestBetContent.linkedContentIngress,
    linkedContentType: bestBetContent.linkedContentType,
    linkedContentDate: bestBetContent.linkedContentDate,
    linkedContentSubject: bestBetContent.linkedContentSubject,
    linkedEnglishContentSubject: bestBetContent.linkedEnglishContentSubject,
    searchWords: bestBetContent.searchWords
  }
}

export const BESTBET_REPO: string = 'no.ssb.bestbet'
export const BESTBET_BRANCH: string = 'master'
export const UNPUBLISHED_BESTBET_BRANCH: string = 'draft'

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

export function deleteBestBet(key: string): string {
  return deleteNode(BESTBET_REPO, BESTBET_BRANCH, key) ? 'slettet' : 'noe gikk feil'
}

export function createBestBet(bestBetContent: BestBetContent): void {
  if (!nodeExists(BESTBET_REPO, BESTBET_BRANCH, bestBetContent.id as string)) {
    createNode(BESTBET_REPO, BESTBET_BRANCH, {
      data: getBestBetData(bestBetContent)
    })
  } else {
    modifyNode(BESTBET_REPO, BESTBET_BRANCH, bestBetContent.id as string, (node) => {
      return {
        ...node,
        data: getBestBetData(bestBetContent)
      }
    })
  }
}

interface SelectedContentResult {
  value: string;
  label: string;
  title: string;
}

export interface BestBetContent {
  id?: string | undefined;
  linkedSelectedContentResult: SelectedContentResult;
  linkedContentTitle: string | undefined;
  linkedContentHref: string | undefined;
  linkedContentIngress: string;
  linkedContentType: string;
  linkedContentDate: string;
  linkedContentSubject: string;
  linkedEnglishContentSubject: string;
  searchWords: Array<string>;
}
