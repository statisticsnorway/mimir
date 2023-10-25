import { Node } from '/lib/xp/node'

import { createRepo, repoExists } from '/lib/ssb/repo/repo'
import { nodeExists, createNode, getNode, getChildNodes, modifyNode, deleteNode } from '/lib/ssb/repo/common'
import { cronJobLog } from '/lib/ssb/utils/serverLog'

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
    searchWords: bestBetContent.searchWords,
  }
}

export const BESTBET_REPO = 'no.ssb.bestbet'
export const BESTBET_BRANCH = 'master'
export const UNPUBLISHED_BESTBET_BRANCH = 'draft'

export function setupBestBetRepo(): void {
  if (!repoExists(BESTBET_REPO, BESTBET_BRANCH)) {
    cronJobLog(`Creating Repo: '${BESTBET_REPO}' ...`)
    createRepo(BESTBET_REPO, BESTBET_BRANCH)
  } else {
    cronJobLog('BestBet Repo found.')
  }
  cronJobLog('BestBet Repo setup complete.')
}

export function listBestBets(count?: number): ReadonlyArray<Node> | Node | null {
  const nodes = getChildNodes(BESTBET_REPO, BESTBET_BRANCH, '/', count ? count : undefined)
  const ids: Array<string> = nodes.hits.map((hit) => {
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
      data: getBestBetData(bestBetContent),
    })
  } else {
    modifyNode(BESTBET_REPO, BESTBET_BRANCH, bestBetContent.id as string, (node) => {
      return {
        ...node,
        data: getBestBetData(bestBetContent),
      }
    })
  }
}

interface SelectedContentResult {
  value: string
  label: string
  title: string
}

export interface BestBetContent {
  id?: string | undefined
  linkedSelectedContentResult: SelectedContentResult
  linkedContentTitle: string | undefined
  linkedContentHref: string | undefined
  linkedContentIngress: string
  linkedContentType: string
  linkedContentDate: string
  linkedContentSubject: string
  linkedEnglishContentSubject: string
  searchWords: Array<string>
}
