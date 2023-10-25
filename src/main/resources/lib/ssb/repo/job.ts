import { QueryNodeParams, Node, NodeQueryResult } from '/lib/xp/node'
import { getUser, User } from '/lib/xp/auth'
import { EditorCallback, EVENT_LOG_REPO, EVENT_LOG_BRANCH, createEventLog } from '/lib/ssb/repo/eventLog'
import { DataSourceInfo, RSSFilterLogData } from '/lib/ssb/cron/rss'
import { modifyNode, getNode, queryNodes } from '/lib/ssb/repo/common'

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
  PUSH_RSS_STATKAL = 'Push RSS statkal',
  REFRESH_DATASET_CALCULATOR_JOB = 'Refresh dataset calculators',
  REFRESH_DATASET_NAMEGRAPH_JOB = 'Refresh dataset nameGraph',
  REFRESH_DATASET_SDDS_TABLES_JOB = 'Refresh dataset for SDDS tables',
}

export const JOB_STATUS_STARTED = 'STARTED' as const
export const JOB_STATUS_COMPLETE = 'COMPLETE' as const

export type JobInfoNode = Node & JobInfo
export type JobEventNode = Node & JobEvent

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

export function updateJobLog(jobId: string, editor: EditorCallback<JobInfoNode>): JobInfoNode {
  return modifyNode(EVENT_LOG_REPO, EVENT_LOG_BRANCH, jobId, editor)
}

export function queryJobLogs(params: QueryNodeParams) {
  return queryNodes(EVENT_LOG_REPO, EVENT_LOG_BRANCH, params)
}

export function getJobLog(id: string) {
  return getNode(EVENT_LOG_REPO, EVENT_LOG_BRANCH, id) as JobInfoNode | ReadonlyArray<JobInfoNode> | null
}

export function completeJobLog(jobLogId: string, message: string, refreshDataResult: object): JobInfoNode {
  const now: Date = new Date()
  return updateJobLog(jobLogId, function (node: JobInfoNode): JobInfoNode {
    node.data = {
      ...node.data,
      completionTime: now.toISOString(),
      status: JOB_STATUS_COMPLETE,
      message,
      refreshDataResult,
    }
    return node as JobInfoNode
  })
}
