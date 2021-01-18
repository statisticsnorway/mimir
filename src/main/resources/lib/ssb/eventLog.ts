import { Content, ContentLibrary, QueryResponse } from 'enonic-types/content'
import { Table } from '../../site/content-types/table/table'
import { Highchart } from '../../site/content-types/highchart/highchart'
import { KeyFigure } from '../../site/content-types/keyFigure/keyFigure'
import { NodeQueryHit, NodeQueryResponse } from 'enonic-types/node'
import { RepoEventLogLib } from '../repo/eventLog'
import { RepoJobLib, JobEventNode } from '../repo/job'
import { RepoCommonLib } from '../repo/common'
import { ServerLogLib } from './serverLog'

const {
  query
}: ContentLibrary = __non_webpack_require__('/lib/xp/content')

const {
  nodeExists,
  getChildNodes,
  queryNodes,
  deleteNode
}: RepoCommonLib = __non_webpack_require__('/lib/repo/common')

const {
  EVENT_LOG_BRANCH,
  EVENT_LOG_REPO
}: RepoEventLogLib = __non_webpack_require__('/lib/repo/eventLog')

const {
  startJobLog,
  updateJobLog,
  JOB_STATUS_COMPLETE
}: RepoJobLib = __non_webpack_require__('/lib/repo/job')

const {
  cronJobLog
}: ServerLogLib = __non_webpack_require__( '/lib/ssb/serverLog')

export function deleteExpiredEventLogs(): void {
  cronJobLog('Delete expired eventlogs')
  const job: JobEventNode = startJobLog('Delete expired eventlogs')
  const path: string = '/queries'
  const maxLogsBeforeDeleting: number = 10
  const monthsBeforeLogsExpire: number = 1

  const contentsWithDatasources: QueryResponse<Table | Highchart | KeyFigure> = query({
    contentTypes: [`${app.name}:table`, `${app.name}:highchart`, `${app.name}:keyfigure`],
    count: 2000,
    query: ``
  })
  const expireDate: Date = new Date()
  expireDate.setMonth(expireDate.getMonth() - monthsBeforeLogsExpire)
  const contentsWithLogs: Array<Content<Table | Highchart | KeyFigure>> = contentsWithDatasources.hits
    .filter((content) => nodeExists(EVENT_LOG_REPO, EVENT_LOG_BRANCH, `${path}/${content._id}`))

  const deleteResult: Array<object> | undefined = contentsWithLogs.reduce( (acc: Array<object>, content) => {
    const eventLogs: NodeQueryResponse<never> = getChildNodes(EVENT_LOG_REPO, EVENT_LOG_BRANCH, `${path}/${content._id}`, 2000)
    if (eventLogs.total > maxLogsBeforeDeleting) {
      acc.push({
        contentId: content._id,
        deleteResult: deleteLog(path, content, expireDate)
      })
    }
    return acc
  }, [])

  updateJobLog(job._id, (node) => {
    node.data = {
      ...node.data,
      refreshDataResult: deleteResult,
      queryIds: contentsWithLogs.map((content: Content<Table | Highchart | KeyFigure>) => content._id),
      status: JOB_STATUS_COMPLETE
    }
    return node
  })
  cronJobLog('Delete expired logs complete')
}

function deleteLog(path: string, content: Content<Table | Highchart | KeyFigure>, expiredDate: Date): Array<string> {
  const query: string = `_parentPath = '${path}/${content._id}' AND _ts < dateTime('${expiredDate.toISOString()}')`
  const expiredLogs: NodeQueryResponse<never> = queryNodes(EVENT_LOG_REPO, EVENT_LOG_BRANCH, {
    query
  })
  return expiredLogs.hits.map( (eventLog: NodeQueryHit) => {
    return deleteNode(EVENT_LOG_REPO, EVENT_LOG_BRANCH, `${path}/${content._id}/${eventLog.id}`) ?
      `Deleted expired event log: ${path}/${content._id}/${eventLog.id}` :
      `Failed to delete event log: ${path}/${content._id}/${eventLog.id}`
  })
}

export interface EventLogLib {
  deleteExpiredEventLogs: () => void;
}
