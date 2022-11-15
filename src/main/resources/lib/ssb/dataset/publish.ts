__non_webpack_require__('/lib/ssb/polyfills/nashorn')
import { Content } from '/lib/xp/content'
import { Statistics } from '../../../site/content-types/statistics/statistics'
import { DataSource } from '../../../site/mixins/dataSource/dataSource'
import { DatasetRepoNode } from '../repo/dataset'
import { StatisticInListing } from '../dashboard/statreg/types'
import { NodeQueryHit } from '/lib/xp/node'
import { Statistic } from '../../../site/mixins/statistic/statistic'
import { listener, EnonicEvent } from '/lib/xp/event'
import { TaskInfo } from '/lib/xp/task'

const { JobNames, JobStatus, queryJobLogs } = __non_webpack_require__('/lib/ssb/repo/job')

const publishTasks: Array<EnonicEvent<TaskInfo>> = []

export function setupTaskListener(): void {
  listener({
    type: 'task.*',
    localOnly: false,
    callback: (event: EnonicEvent<TaskInfo>) => {
      if (event.type !== 'task.finished' && event.data.name === `${app.name}:publishDataset`) {
        publishTasks.push(event)
      }
      const oldTask: EnonicEvent<TaskInfo> | undefined = publishTasks.find((t) => t.data.id === event.data.id)
      if (oldTask && oldTask !== event) {
        const taskIndex: number = publishTasks.indexOf(oldTask)
        publishTasks.splice(taskIndex, 1)
      }
      // log.info(JSON.stringify(publishTasks.map((t) => `${t.data.id} :: ${t.data.progress.info}`), null, 2))
    },
  })
}

export function currentlyWaitingForPublish(statistic: Content<Statistics & Statistic>): boolean {
  const from: string = new Date(Date.now() - 1800000).toISOString()
  const to: string = new Date().toISOString()
  const jobRes: NodeQueryHit | null = queryJobLogs({
    start: 0,
    count: 1,
    query: `
      _path LIKE "/jobs/*" AND 
      data.task = "${JobNames.PUBLISH_JOB}" AND 
      data.status = "${JobStatus.STARTED}" AND 
      range("_ts", instant("${from}"), instant("${to}"))`,
    sort: '_ts DESC',
  }).hits[0]
  if (jobRes) {
    const myTask: EnonicEvent<TaskInfo> | undefined = publishTasks.find((t) => {
      return t.data.progress.info === statistic.data.statistic || t.data.progress.info === ''
    })
    if (myTask) {
      return true
    }
  }
  return false
}

export interface PublishDatasetLib {
  setupTaskListener: () => void
  currentlyWaitingForPublish: (statistic: Content<Statistic>) => boolean
}

export interface PublicationItem {
  dataset: DatasetRepoNode<object> | null
  dataSource: Content<DataSource>
}
