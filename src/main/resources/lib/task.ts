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
  log.info('refreshQueriesAsync')
  const httpQueriesBatch: Array<Array<Content<Dataquery>>> = splitEvery((httpQueries.count / batchSize), httpQueries.hits)
  let a: number = 0;
  return httpQueriesBatch.map( (httpQueries: Array<Content<Dataquery>>) => {
    a++
    log.info(`batch ${a} with ${httpQueries.length} items`)
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
          refreshQuery(httpQuery)
        })
      }
    })
  })
}
