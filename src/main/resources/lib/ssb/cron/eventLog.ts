import { NodeQueryHit, NodeQueryResponse, RepoNode } from '/lib/xp/node'
import { JobEventNode } from '../repo/job'

const { getChildNodes, queryNodes, withConnection, getNode } = __non_webpack_require__('/lib/ssb/repo/common')

const { EVENT_LOG_BRANCH, EVENT_LOG_REPO } = __non_webpack_require__('/lib/ssb/repo/eventLog')

const { startJobLog, updateJobLog, JOB_STATUS_COMPLETE } = __non_webpack_require__('/lib/ssb/repo/job')

const { cronJobLog } = __non_webpack_require__('/lib/ssb/utils/serverLog')

interface RepoNodeExtended extends RepoNode {
  _path: string
  _name: string
}

export function deleteExpiredEventLogs(): void {
  cronJobLog('Deleting expired eventlogs')
  const job: JobEventNode = startJobLog('Delete expired eventlogs')
  const path = '/queries'
  const maxLogsBeforeDeleting = 10
  const monthsBeforeLogsExpire = 1

  const expireDate: Date = new Date()
  expireDate.setMonth(expireDate.getMonth() - monthsBeforeLogsExpire)

  const parentNodes: Array<RepoNodeExtended> = queryNodes(EVENT_LOG_REPO, EVENT_LOG_BRANCH, {
    query: `_parentPath = "${path}"`,
    count: 3000,
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
      const deleteResult: Array<string> = deleteLog(path, parent, expireDate, eventLogs.total)
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
    }
    return node
  })
  cronJobLog('Delete expired logs complete')
}

// TODO make sure there is at least 10 logs left after delete
// sort by _ts and compare to count (which is eventlogs.total)
// it might work with using count -10 if the sorting is correct as well
function deleteLog(path: string, parent: RepoNodeExtended, expiredDate: Date, count: number): Array<string> {
  const query = `_parentPath = '${parent._path}' AND _ts < dateTime('${expiredDate.toISOString()}')`
  const expiredLogs: NodeQueryResponse = queryNodes(EVENT_LOG_REPO, EVENT_LOG_BRANCH, {
    query,
    count,
  })
  return withConnection(EVENT_LOG_REPO, EVENT_LOG_BRANCH, (conn) => {
    return conn.delete(expiredLogs.hits.map((h) => h.id)).map((id) => {
      return `Deleted expired event log: ${parent._id}/${id}`
    })
  })
}

export interface EventLogLib {
  deleteExpiredEventLogs: () => void
}
