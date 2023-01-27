import { NodeQueryParams, NodeQueryResponse, RepoNode } from '/lib/xp/node'
import { EditorCallback } from '/lib/ssb/repo/eventLog'
import { getUser, User } from '/lib/xp/auth'
import { DataSourceInfo, RSSFilterLogData } from '/lib/ssb/cron/rss'
const { modifyNode, getNode, queryNodes } = __non_webpack_require__('/lib/ssb/repo/common')
const { EVENT_LOG_REPO, EVENT_LOG_BRANCH, createEventLog } = __non_webpack_require__('/lib/ssb/repo/eventLog')

export enum JobStatus {
  STARTED = 'STARTED',
  COMPLETE = 'COMPLETE',
  SKIPPED = 'SKIPPED',
  ERROR = 'ERROR',
}

export enum JobNames {
  PUBLISH_JOB = 'Publish statistics',
  STATREG_JOB = 'Refresh statreg data',
  STATISTICS_REFRESH_JOB = 'refresh statistics',
  REFRESH_DATASET_JOB = 'Refresh dataset',
  PUSH_RSS_NEWS = 'Push RSS news',
  REFRESH_DATASET_CALCULATOR_JOB = 'Refresh dataset calculators',
  REFRESH_DATASET_NAMEGRAPH_JOB = 'Refresh dataset nameGraph',
}

export const JOB_STATUS_STARTED: 'STARTED' = 'STARTED'
export const JOB_STATUS_COMPLETE: 'COMPLETE' = 'COMPLETE'

export type JobInfoNode = RepoNode & JobInfo
export type JobEventNode = RepoNode & JobEvent

export interface JobInfo {
  data: {
    status: typeof JOB_STATUS_STARTED | typeof JOB_STATUS_COMPLETE
    task: string
    refreshDataResult: object | Array<StatisticsPublishResult> | DatasetRefreshResult | CalculatorRefreshResult
    message: string
    httpStatusCode?: number
    jobStarted: string
    completionTime: string
    queryIds?: Array<string>
    user: User
  }
}

export interface DatasetRefreshResult {
  filterInfo: RSSFilterLogData
  result: Array<DataSourceInfo>
}

export interface CalculatorRefreshResult {
  result: Array<DataSourceInfo>
}

export interface StatisticsPublishResult {
  statistic: string
  shortNameId: string
  status: string
  dataSources: Array<DataSourceStatisticsPublishResult>
}

export interface DataSourceStatisticsPublishResult {
  id: string
  status: string
  message: string
}
export interface JobEvent {
  data: {
    task?: string
    jobStarted: string
    status: string
    user: User | null
  }
}

export function startJobLog(task?: string): JobEventNode {
  const user: User | null = getUser()
  const now: Date = new Date()
  return createEventLog({
    _parentPath: '/jobs',
    data: {
      task: task,
      jobStarted: now.toISOString(),
      status: JOB_STATUS_STARTED,
      user,
    },
  })
}

export function updateJobLog<T>(jobId: string, editor: EditorCallback<JobInfoNode>): JobInfoNode {
  return modifyNode(EVENT_LOG_REPO, EVENT_LOG_BRANCH, jobId, editor)
}

export function queryJobLogs(params: NodeQueryParams): NodeQueryResponse {
  return queryNodes(EVENT_LOG_REPO, EVENT_LOG_BRANCH, params)
}

export function getJobLog(id: string): JobInfoNode | ReadonlyArray<JobInfoNode> | null {
  return getNode<JobInfoNode>(EVENT_LOG_REPO, EVENT_LOG_BRANCH, id)
}

export function completeJobLog(jobLogId: string, message: string, refreshDataResult: object): JobInfoNode {
  const now: Date = new Date()
  return updateJobLog<JobInfoNode>(jobLogId, function (node: JobInfoNode): JobInfoNode {
    node.data = {
      ...node.data,
      completionTime: now.toISOString(),
      status: JOB_STATUS_COMPLETE,
      message,
      refreshDataResult,
    }
    return node
  })
}

export interface RepoJobLib {
  JOB_STATUS_STARTED: typeof JOB_STATUS_STARTED
  JOB_STATUS_COMPLETE: typeof JOB_STATUS_COMPLETE
  JobNames: typeof JobNames
  JobStatus: typeof JobStatus
  startJobLog: (task?: string) => JobEventNode
  updateJobLog: <T>(jobId: string, editor: EditorCallback<JobInfoNode>) => JobInfoNode
  queryJobLogs: <T>(params: NodeQueryParams) => NodeQueryResponse
  getJobLog: (id: string) => JobInfoNode | ReadonlyArray<JobInfoNode> | null
  completeJobLog: (jobLogId: string, message: string, refreshDataResult: object) => JobInfoNode
}
