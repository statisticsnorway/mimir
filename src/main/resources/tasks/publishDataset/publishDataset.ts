__non_webpack_require__('/lib/ssb/polyfills/nashorn')
import { run as runInContext } from '/lib/xp/context'
import { type PublishDataset as PublishDatasetConfig } from '/tasks/publishDataset'
import { send } from '/lib/xp/event'

import { progress, sleep } from '/lib/xp/task'
import { create as createScheduledJob } from '/lib/xp/scheduler'

import { cronContext } from '/lib/ssb/cron/cron'
import { createOrUpdateDataset, DATASET_BRANCH } from '/lib/ssb/repo/dataset'
import { extractKey } from '/lib/ssb/dataset/dataset'

export function run(props: PublishDatasetConfig): void {
  const { jobId, statisticsContentId, publicationItem, statisticsId, datasetIndex } = props
  const { dataSource, dataset } = JSON.parse(publicationItem)
  if (dataset && dataSource.data.dataSource) {
    progress({
      info: `${statisticsId}`,
    })
    sleep(1000)

    const key: string | null = extractKey(dataSource)
    const sleepFor: number = Number(datasetIndex) * 1000
    const dateWithSleep: string = new Date(new Date().getTime() + sleepFor).toISOString()

    if (key) {
      log.info(
        `PublishDataset - Start publishing dataset: ${dataSource.data.dataSource?._selected} Key: ${key} for Statistikk ${statisticsId}`
      )
      createOrUpdateDataset(dataSource.data.dataSource?._selected, DATASET_BRANCH, key, dataset.data)
      log.info(
        `PublishDataset - Finish publishing dataset: ${dataSource.data.dataSource?._selected} Key: ${key} for Statistikk ${statisticsId}`
      )

      send({
        type: 'clearDatasetCache',
        distributed: true,
        data: {
          path: dataset._path,
        },
      })
    }

    runInContext(cronContext, () => {
      log.info(
        `PublishDataset - create task: cleanupPublishDataset_${jobId}_${statisticsId}_${dataset._name} Time: ${dateWithSleep}`
      )
      createScheduledJob({
        name: `cleanupPublishDataset_${jobId}_${statisticsId}_${dataset._name}`,
        descriptor: 'mimir:cleanupPublishDataset',
        enabled: true,
        schedule: {
          type: 'ONE_TIME',
          value: dateWithSleep,
        },
        config: {
          jobId: jobId,
          statisticsContentId: statisticsContentId,
          statisticsId: statisticsId,
          publicationItem: publicationItem,
        },
      })
    })
  }
}
