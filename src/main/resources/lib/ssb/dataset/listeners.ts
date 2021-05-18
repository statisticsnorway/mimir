import { Content, ContentLibrary, QueryResponse } from 'enonic-types/content'
import { EnonicEvent, EnonicEventData, EventLibrary } from 'enonic-types/event'
import { SSBCronLib } from '../cron/cron'
import { RepoDatasetLib } from '../repo/dataset'
import { DatasetLib } from './dataset'
import { DataSource } from '../../../site/mixins/dataSource/dataSource'
import { RepoCommonLib } from '../repo/common'
import { TaskLib } from '../../types/task'
import { ContextLibrary } from 'enonic-types/context'
import { ServerLogLib } from '../utils/serverLog'

const {
  listener
}: EventLibrary = __non_webpack_require__('/lib/xp/event')
const {
  query
}: ContentLibrary = __non_webpack_require__('/lib/xp/content')
const {
  run
}: ContextLibrary = __non_webpack_require__('/lib/xp/context')
const {
  refreshDataset
}: DatasetLib = __non_webpack_require__( '/lib/ssb/dataset/dataset')
const {
  runOnMasterOnly,
  cronContext
}: SSBCronLib = __non_webpack_require__('/lib/ssb/cron/cron')
const {
  DataSource: DataSourceType
}: RepoDatasetLib = __non_webpack_require__( '/lib/ssb/repo/dataset')
const {
  ENONIC_CMS_DEFAULT_REPO
}: RepoCommonLib = __non_webpack_require__('/lib/ssb/repo/common')
const {
  submit, sleep, isRunning
}: TaskLib = __non_webpack_require__('/lib/xp/task')
const {
  autoRefreshLog
}: ServerLogLib = __non_webpack_require__('/lib/ssb/utils/serverLog')

let refreshQueue: Array<Content<DataSource>> = []
let refreshTask: string | null = null

export function setupFetchDataOnCreateListener(): void {
  listener({
    type: 'node.updated',
    callback: function(event: EnonicEvent) {
      runOnMasterOnly(() => {
        const nodes: EnonicEventData['nodes'] = event.data.nodes.filter((n) => n.repo === ENONIC_CMS_DEFAULT_REPO )
        if (nodes.length > 0) {
          const contentWithDataSource: QueryResponse<DataSource> = query({
            count: nodes.length,
            query: `_id IN(${nodes.map((n) => `'${n.id}'`).join(',')}) AND 
                (
                  data.dataSource._selected = '${DataSourceType.STATBANK_API}' OR 
                  data.dataSource._selected = '${DataSourceType.TBPROCESSOR}' OR 
                  data.dataSource._selected = '${DataSourceType.STATBANK_SAVED}' OR 
                  data.dataSource._selected = '${DataSourceType.KLASS}'
                )`,
            contentTypes: [
              `${app.name}:highchart`,
              `${app.name}:keyFigure`,
              `${app.name}:table`,
              `${app.name}:genericDataImport`
            ],
            filters: {
              exists: {
                field: `data.dataSource.*.urlOrId`
              }
            }
          })
          if (contentWithDataSource.hits.length > 0) {
            contentWithDataSource.hits.forEach((dataSource) => {
              if (!refreshQueue.find((queueItem) => queueItem._id === dataSource._id)) {
                autoRefreshLog(`add ${dataSource._id} to queue`)
                refreshQueue.push(dataSource)
              } else {
                autoRefreshLog(`already in queue ${dataSource._id}`)
              }
            })
            startRefreshTask()
          }
        }
      })
    }
  })
}

function startRefreshTask(): void {
  autoRefreshLog('try to start task')
  if (!refreshTask || !isRunning(refreshTask)) {
    autoRefreshLog('task not running, start new')
    const refreshQueueLength: number = refreshQueue.length
    refreshTask = submit({
      description: 'refresh dataset task',
      task: () => {
        try {
          const debounce: number = app.config && app.config['ssb.dataset.autoRefreshDebounce'] ? parseInt(app.config['ssb.dataset.autoRefreshDebounce']) : 10000
          sleep(debounce)
          if (refreshQueueLength === refreshQueue.length) {
            autoRefreshLog(`clear queue : ${refreshQueue.map((c) => c._id).join(', ')}`)
            run(cronContext, () => {
              refreshQueue.forEach((dataSource) => refreshDataset(dataSource))
            })
            refreshQueue = []
            refreshTask = null
          } else {
            autoRefreshLog(`clear changed, wait ${debounce}ms`)
            refreshTask = null
            startRefreshTask()
          }
        } catch (error) {
          log.info(`autoRefreshError :: ${error.toString()} :: ${error.printStackTrace()}`)
        }
      }
    })
  } else {
    autoRefreshLog('task already running')
    // do nothing
  }
}
