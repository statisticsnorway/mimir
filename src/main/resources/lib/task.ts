import { Content } from 'enonic-types/content'
import { splitEvery } from 'ramda'
import { DatasetLib, CreateOrUpdateStatus } from './ssb/dataset/dataset'
import { DataSource } from '../site/mixins/dataSource/dataSource'
import { RepoQueryLib } from './repo/query'

const {
  refreshDataset
}: DatasetLib = __non_webpack_require__('/lib/ssb/dataset/dataset')
const {
  progress,
  submit
} = __non_webpack_require__('/lib/xp/task')
const {
  logAdminDataQuery,
  Events
}: RepoQueryLib = __non_webpack_require__('/lib/repo/query')

export function refreshQueriesAsync(httpQueries: Array<Content<DataSource>>, batchSize: number = 4): Array<string> {
  const httpQueriesBatch: Array<Array<Content<DataSource>>> = splitEvery((httpQueries.length / batchSize), httpQueries)
  let a: number = 0
  return httpQueriesBatch.map( (httpQueries: Array<Content<DataSource>>) => {
    a++
    return submit({
      description: `RefreshRows_${a}`,
      task: function() {
        progress({
          info: `Start task for datasets ${httpQueries.map((httpQuery) => httpQuery._id)}`
        })
        httpQueries.map((httpQuery: Content<DataSource>) => {
          progress({
            info: `Refresh dataset ${httpQuery._id}`
          })
          logAdminDataQuery(httpQuery._id, {
            message: Events.GET_DATA_STARTED
          })
          const result: CreateOrUpdateStatus = refreshDataset(httpQuery, false)
          logAdminDataQuery(httpQuery._id, {
            message: result.status
          })
        })
      }
    })
  })
}
