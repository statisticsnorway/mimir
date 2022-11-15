import { query, Content, QueryResponse } from '/lib/xp/content'
import { listener, EnonicEvent, EnonicEventData } from '/lib/xp/event'
import { DataSource } from '../../../site/mixins/dataSource/dataSource'
import { run } from '/lib/xp/context'

const { refreshDataset } = __non_webpack_require__('/lib/ssb/dataset/dataset')
const { runOnMasterOnly, cronContext } = __non_webpack_require__('/lib/ssb/cron/cron')
const { DataSource: DataSourceType } = __non_webpack_require__('/lib/ssb/repo/dataset')
const { ENONIC_CMS_DEFAULT_REPO } = __non_webpack_require__('/lib/ssb/repo/common')
const { executeFunction, sleep, isRunning } = __non_webpack_require__('/lib/xp/task')
const { autoRefreshLog } = __non_webpack_require__('/lib/ssb/utils/serverLog')

let refreshQueue: Array<Content<DataSource>> = []
let refreshTask: string | null = null

export function setupFetchDataOnCreateListener(): void {
  listener({
    type: 'node.updated',
    callback: function (event: EnonicEvent) {
      runOnMasterOnly(() => {
        const nodes: EnonicEventData['nodes'] = event.data.nodes.filter((n) => n.repo === ENONIC_CMS_DEFAULT_REPO)
        if (nodes.length > 0) {
          const contentWithDataSource: QueryResponse<DataSource, object> = query({
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
              `${app.name}:genericDataImport`,
            ],
            filters: {
              exists: {
                field: `data.dataSource.*.urlOrId`,
              },
            },
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
    },
  })
}

function startRefreshTask(): void {
  autoRefreshLog('try to start task')
  if (!refreshTask || !isRunning(refreshTask)) {
    autoRefreshLog('task not running, start new')
    const refreshQueueLength: number = refreshQueue.length
    refreshTask = executeFunction({
      description: 'refresh dataset task',
      func: () => {
        try {
          const debounce: number =
            app.config && app.config['ssb.dataset.autoRefreshDebounce']
              ? parseInt(app.config['ssb.dataset.autoRefreshDebounce'])
              : 10000
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
      },
    })
  } else {
    autoRefreshLog('task already running')
    // do nothing
  }
}

export interface DatasetListenersLib {
  setupFetchDataOnCreateListener: () => void
}
