import { Content, QueryResponse } from 'enonic-types/lib/content'
import { Dataquery } from '../site/content-types/dataquery/dataquery'
import { splitEvery } from 'ramda'
import { DatasetLib, CreateOrUpdateStatus } from './ssb/dataset/dataset'
import { DataSource } from '../site/mixins/dataSource/dataSource'
import { RepoQueryLib } from './repo/query'

const {
  refreshQuery
} = __non_webpack_require__('/lib/dataquery')
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

export function refreshQueriesAsync(httpQueries: QueryResponse<Dataquery>, batchSize: number = 4): Array<string> {
  const httpQueriesBatch: Array<Array<Content<Dataquery>>> = splitEvery((httpQueries.count / batchSize), httpQueries.hits)
  let a: number = 0
  return httpQueriesBatch.map( (httpQueries: Array<Content<Dataquery>>) => {
    a++
    return submit({
      description: `RefreshRows_${a}`,
      task: function() {
        progress({
          info: `Start task for datasets ${httpQueries.map((httpQuery) => httpQuery._id)}`
        })
        httpQueries.map((httpQuery: Content<Dataquery>) => {
          progress({
            info: `Refresh dataset ${httpQuery._id}`
          })
          if (httpQuery.type === `${app.name}:dataquery`) { // old
            refreshQuery(httpQuery)
          } else { // new
            logAdminDataQuery(httpQuery._id, {
              message: Events.GET_DATA_STARTED
            })
            const result: CreateOrUpdateStatus = refreshDataset(httpQuery as Content<DataSource>, false)
            logAdminDataQuery(httpQuery._id, {
              message: result.status
            })
          }
        })
      }
    })
  })
}
