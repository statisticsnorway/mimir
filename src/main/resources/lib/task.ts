import { Content, QueryResponse } from 'enonic-types/lib/content'
import { Dataquery } from '../site/content-types/dataquery/dataquery'
import { splitEvery } from 'ramda'

const {
  refreshQuery
} = __non_webpack_require__('/lib/dataquery')

const {
  progress,
  submit
} = __non_webpack_require__('/lib/xp/task')

export function refreshQueriesAsync(httpQueries: QueryResponse<Dataquery>, batchSize: number = 4): Array<string> {
  const httpQueriesBatch: Array<Array<Content<Dataquery>>> = splitEvery(batchSize, httpQueries.hits)
  return httpQueriesBatch.map( (httpQueries: Array<Content<Dataquery>>) => {
    return submit({
      description: `RefreshRows`,
      task: function() {
        progress({
          info: `Start task for datasets ${httpQueries.map((httpQuery) => httpQuery._id)}`
        })
        httpQueries.map((httpQuery: Content<Dataquery>) => {
          progress({
            info: `Refresh dataset ${httpQuery._id}`
          })
          refreshQuery(httpQuery)
        })
      }
    })
  })
}
