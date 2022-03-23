import { Content } from 'enonic-types/content'
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
const {
  get
} = __non_webpack_require__('/lib/xp/content')

function getBestBetData(bestBetContent: BestBetContent): BestBetContent {
  let date: string = bestBetContent.linkedContentDate
  let title: string | undefined = bestBetContent.linkedContentTitle
  let href: string | undefined = bestBetContent.linkedContentHref
  const xpContentId: string = bestBetContent.linkedSelectedContentResult.value
  if (xpContentId) {
    const xpContent: Content | null = xpContentId ? get({
      key: xpContentId
    }) : null

    date = getDate(bestBetContent.linkedContentDate, xpContent)
    if (xpContent) {
      title = xpContent.displayName
      href = xpContent._path
    }
  }

  return {
    linkedSelectedContentResult: bestBetContent.linkedSelectedContentResult,
    linkedContentTitle: title,
    linkedContentHref: href,
    linkedContentIngress: bestBetContent.linkedContentIngress,
    linkedContentType: bestBetContent.linkedContentType,
    linkedContentDate: date,
    linkedContentSubject: bestBetContent.linkedContentSubject,
    searchWords: bestBetContent.searchWords
  }
}

function getDate(date: string, xpContent: Content | null): string {
  if (date === 'xp') {
    if (xpContent && xpContent.publish && xpContent.publish.from) {
      return xpContent.publish.from
    } else {
      return ''
    }
  } else {
    return date
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
  searchWords: Array<string>;
}
