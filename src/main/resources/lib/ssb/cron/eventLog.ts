import { type Node } from '/lib/xp/node'
import { sleep } from '/lib/xp/task'
import { JobEventNode, startJobLog, updateJobLog, JOB_STATUS_COMPLETE } from '/lib/ssb/repo/job'

import * as util from '/lib/util'

import { getChildNodes, queryNodes, withConnection, getNode } from '/lib/ssb/repo/common'

import { EVENT_LOG_BRANCH, EVENT_LOG_REPO } from '/lib/ssb/repo/eventLog'

import { cronJobLog } from '/lib/ssb/utils/serverLog'

type DeletedCount = { contentId: string; deletedCount: number }

export function deleteExpiredEventLogsForQueries(): void {
  cronJobLog('Deleting expired event logs for queries')
  const job: JobEventNode = startJobLog('Delete expired event logs for queries')
  const path = '/queries'
  const maxLogsBeforeDeleting = 10 // Have at least 10 logs left for each query to keep its log history
  const monthsBeforeLogsExpire = 1

  const expireDate: Date = new Date()
  expireDate.setMonth(expireDate.getMonth() - monthsBeforeLogsExpire)

  let nodeTree: { [key: string]: Node[] } = {}
  let deleteResult: DeletedCount[] = []
  let totalExpiredLogsDeleted = 0

  let start = 0
  let total = 999999999
  const count = 200

  while (start < total) {
    sleep(100)
    const resultParents = queryNodes(EVENT_LOG_REPO, EVENT_LOG_BRANCH, {
      query: `_parentPath = "${path}"`,
      start,
      count,
    })

    total = resultParents.total
    start += count

    resultParents.hits.forEach((parentHit) => {
      const children = getChildNodes(EVENT_LOG_REPO, EVENT_LOG_BRANCH, parentHit.id, count, false)
      if (children.total > maxLogsBeforeDeleting) {
        nodeTree[parentHit.id] = util.data.forceArray(
          getNode(
            EVENT_LOG_REPO,
            EVENT_LOG_BRANCH,
            children.hits.map((n) => n.id)
          )
        ) as Node[]
      }
    })

    const _deleteResult = Object.keys(nodeTree).reduce((acc: DeletedCount[], parentId: string) => {
      // Sort by date, we want the 10 latest to be kept
      const logs = nodeTree[parentId].sort((a, b) => {
        return new Date(a._ts).getTime() - new Date(b._ts).getTime()
      })
      const logCount = logs.length

      if (logCount > maxLogsBeforeDeleting) {
        const toBeDeleted = logs.slice(0, logCount - maxLogsBeforeDeleting).filter((node) => {
          // Even if above 10, keep them if not expired yet
          return new Date(node._ts) < expireDate
        })

        const deletedCount = withConnection(EVENT_LOG_REPO, EVENT_LOG_BRANCH, (conn) => {
          if (toBeDeleted.length === 0) return 0

          return conn.delete(toBeDeleted.map((n) => n._id)).length
        })

        acc.push({
          contentId: parentId,
          deletedCount,
        })
      }
      return acc
    }, [])

    deleteResult = [...deleteResult, ..._deleteResult]
    nodeTree = {}
    const deletedCount = _deleteResult.map((d) => d.deletedCount).reduce((partialSum, a) => partialSum + a, 0)
    totalExpiredLogsDeleted += deletedCount
  }

  updateJobLog(job._id, (node) => {
    node.data = {
      ...node.data,
      refreshDataResult: deleteResult,
      status: JOB_STATUS_COMPLETE,
      message:
        totalExpiredLogsDeleted != 0
          ? `Slettet ${totalExpiredLogsDeleted} utdaterte event logs`
          : 'Ingen utdaterte event logs ble slettet',
    }
    return node
  })

  cronJobLog(`Delete expired logs for queries complete. Total expired logs deleted: ${totalExpiredLogsDeleted}`)
}
