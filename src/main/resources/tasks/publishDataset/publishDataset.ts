import { cronContext } from '../../lib/ssb/cron/cron'
import { CleanupPublishDatasetConfig } from '../cleanupPublishDataset/cleanupPublishDataset-config'
import { PublishDatasetConfig } from './publishDataset-config'
__non_webpack_require__('/lib/ssb/polyfills/nashorn')

const {
  extractKey
} = __non_webpack_require__('/lib/ssb/dataset/dataset')
const {
  createOrUpdateDataset,
  DATASET_BRANCH
} = __non_webpack_require__('/lib/ssb/repo/dataset')
const {
  send
} = __non_webpack_require__('/lib/xp/event')
const {
  progress,
  sleep
} = __non_webpack_require__('/lib/xp/task')
const {
  create: createScheduledJob
} = __non_webpack_require__('/lib/xp/scheduler')
const {
  run
} = __non_webpack_require__('/lib/xp/context')

exports.run = function(props: PublishDatasetConfig): void {
  const {
    jobId,
    statisticsContentId,
    publicationItem,
    statisticsId
  } = props
  const {
    dataSource,
    dataset
  } = JSON.parse(publicationItem)
  if (dataset && dataSource.data.dataSource) {
    progress({
      info: `${statisticsId}`
    })
    sleep(1000)

    const key: string | null = extractKey(dataSource)

    if (key) {
      log.info(`publishing dataset ${dataSource.data.dataSource?._selected} - ${key} for ${statisticsId}`)
      createOrUpdateDataset(dataSource.data.dataSource?._selected, DATASET_BRANCH, key, dataset.data)
      log.info(`finished publish of dataset ${dataSource.data.dataSource?._selected} - ${key} for ${statisticsId}`)

      send({
        type: 'clearDatasetCache',
        distributed: true,
        data: {
          path: dataset._path
        }
      })
    }

    run(cronContext, () => {
      createScheduledJob<CleanupPublishDatasetConfig>({
        name: `cleanupPublishDataset_${jobId}_${statisticsId}_${dataset._name}`,
        descriptor: 'mimir:cleanupPublishDataset',
        enabled: true,
        schedule: {
          type: 'ONE_TIME',
          value: new Date().toISOString()
        },
        // TODO remove after enonic-types fix
        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore
        config: {
          jobId: jobId,
          statisticsContentId: statisticsContentId,
          statisticsId: statisticsId,
          publicationItem: publicationItem
        }
      })
    })
  }
}
