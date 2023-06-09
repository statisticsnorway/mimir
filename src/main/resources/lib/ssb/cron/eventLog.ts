import { NodeQueryHit, NodeQueryResponse, RepoNode } from '/lib/xp/node'
import { JobEventNode } from '/lib/ssb/repo/job'

const { getChildNodes, queryNodes, withConnection, getNode } = __non_webpack_require__('/lib/ssb/repo/common')

const { EVENT_LOG_BRANCH, EVENT_LOG_REPO } = __non_webpack_require__('/lib/ssb/repo/eventLog')

const { startJobLog, updateJobLog, JOB_STATUS_COMPLETE } = __non_webpack_require__('/lib/ssb/repo/job')

const { cronJobLog } = __non_webpack_require__('/lib/ssb/utils/serverLog')

interface RepoNodeExtended extends RepoNode {
  _path: string
  _name: string
}

let totalExpiredLogsDeleted = 0

export function deleteExpiredEventLogsForQueries(): void {
  cronJobLog('Deleting expired event logs for queries')
  const job: JobEventNode = startJobLog('Delete expired event logs for queries')
  const path = '/queries'
  const maxLogsBeforeDeleting = 10
  const monthsBeforeLogsExpire = 1

  const expireDate: Date = new Date()
  expireDate.setMonth(expireDate.getMonth() - monthsBeforeLogsExpire)

  const parentNodes: Array<RepoNodeExtended> = queryNodes(EVENT_LOG_REPO, EVENT_LOG_BRANCH, {
    query: `_parentPath = "${path}"`,
    count: 20000,
  }).hits.reduce((acc: Array<RepoNodeExtended>, parentNodeHit: NodeQueryHit) => {
    const parentNode: RepoNodeExtended | null = getNode<RepoNodeExtended>(
      EVENT_LOG_REPO,
      EVENT_LOG_BRANCH,
      parentNodeHit.id
    ) as RepoNodeExtended | null
    if (parentNode) {
      acc.push(parentNode)
    }
    return acc
  }, [])

  const deleteResult: Array<object> | undefined = parentNodes.reduce((acc: Array<object>, parent) => {
    const eventLogs: NodeQueryResponse = getChildNodes(EVENT_LOG_REPO, EVENT_LOG_BRANCH, `${parent._id}`, 0, true)
    if (eventLogs.total > maxLogsBeforeDeleting) {
      const deleteResult: Array<string> = deleteLog(parent, expireDate, eventLogs.total)
      acc.push({
        contentId: parent._name,
        deleteResult,
      })
    }
    return acc
  }, [])

  updateJobLog(job._id, (node) => {
    node.data = {
      ...node.data,
      refreshDataResult: deleteResult,
      queryIds: parentNodes.map((parent: RepoNodeExtended) => parent._name),
      status: JOB_STATUS_COMPLETE,
      message:
        totalExpiredLogsDeleted != 0
          ? `Successfully deleted ${totalExpiredLogsDeleted} expired logs.`
          : 'No expired logs deleted.',
    }
    return node
  })
  cronJobLog(`Delete expired logs for queries complete. Total expired logs deleted: ${totalExpiredLogsDeleted}`)
  totalExpiredLogsDeleted = 0
}

function deleteLog(parent: RepoNodeExtended, expiredDate: Date, count: number): Array<string> {
  const query = `_parentPath = '${parent._path}' AND _ts < dateTime('${expiredDate.toISOString()}')`
  const expiredLogs: NodeQueryResponse = queryNodes(EVENT_LOG_REPO, EVENT_LOG_BRANCH, {
    query,
    count: count - 10,
    sort: '_ts ASC',
  })

  totalExpiredLogsDeleted += expiredLogs.hits.length

  return withConnection(EVENT_LOG_REPO, EVENT_LOG_BRANCH, (conn) => {
    return conn.delete(expiredLogs.hits.map((h) => h.id)).map((id) => {
      return `Deleted expired event log: ${parent._id}/${id}`
    })
  })
}

export interface EventLogLib {
  deleteExpiredEventLogsForQueries: () => void
}
