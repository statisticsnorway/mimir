__non_webpack_require__('/lib/ssb/polyfills/nashorn')
import { Content } from '/lib/xp/content'
import { NodeQueryResultHit } from '/lib/xp/node'
import { listener, EnonicEvent } from '/lib/xp/event'
import { TaskInfo } from '/lib/xp/task'
import { DatasetRepoNode } from '/lib/ssb/repo/dataset'

import { JobNames, JobStatus, queryJobLogs } from '/lib/ssb/repo/job'
import { type Statistic } from '/site/mixins/statistic'
import { type DataSource } from '/site/mixins/dataSource'
import { type Statistics } from '/site/content-types'

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
  const jobRes: NodeQueryResultHit | null = queryJobLogs({
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

export interface PublicationItem {
  dataset: DatasetRepoNode<object> | null
  dataSource: Content<DataSource>
}
