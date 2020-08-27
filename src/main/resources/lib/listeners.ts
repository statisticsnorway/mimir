import { Content, QueryResponse } from 'enonic-types/lib/content'
import { HighchartConfig } from '../site/macros/highchart/highchart-config'
import { KeyFigure } from '../site/content-types/keyFigure/keyFigure'
import { Table } from '../site/content-types/table/table'
import { EnonicEvent } from 'enonic-types/lib/event'

const {
  listener
} = __non_webpack_require__('/lib/xp/event')
const {
  query
} = __non_webpack_require__('/lib/xp/content')
const {
  DataSource
} = __non_webpack_require__('/lib/repo/dataset')
const {
  refreshDataset
} = __non_webpack_require__( '/lib/ssb/dataset/dataset')


export function setupFetchDataOnCreateListener() {
  listener({
    type: 'node.updated',
    callback: function(event: EnonicEvent) {
      const contentWithDataSource: QueryResponse<HighchartConfig | KeyFigure | Table> = query({
        query: `_id = '${event.data.nodes[0].id}' AND 
          ( data.dataSource._selected = '${DataSource.STATBANK_API}' OR data.dataSource._selected = '${DataSource.TBPROCESSOR}' )`,
        contentTypes: [`${app.name}:highchart`, `${app.name}:keyFigure`, `${app.name}:table`],
        filters: {
          exists: {
            field: `data.dataSource.*.urlOrId`
          }
        }
      })
      contentWithDataSource.hits.forEach((content: Content<HighchartConfig | KeyFigure | Table>) => refreshDataset(content))
    }
  })
}

