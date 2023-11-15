__non_webpack_require__('/lib/ssb/polyfills/nashorn')
import { Content } from '/lib/xp/content'
import { listener, EnonicEvent } from '/lib/xp/event'
import { TaskInfo } from '/lib/xp/task'
import { DatasetRepoNode } from '/lib/ssb/repo/dataset'

import { type DataSource } from '/site/mixins/dataSource'

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

export interface PublicationItem {
  dataset: DatasetRepoNode<object> | null
  dataSource: Content<DataSource>
}
