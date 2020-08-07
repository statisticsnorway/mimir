import {Content, QueryResponse} from 'enonic-types/lib/content'
import { HighchartConfig } from '../site/macros/highchart/highchart-config'
import { KeyFigure } from '../site/content-types/keyFigure/keyFigure'
import {EnonicEvent} from 'enonic-types/lib/event'

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
  log.info('Setting up listeners')
  listener({
    type: 'node.updated',
    callback: function(event: EnonicEvent) {
      const contentWithDataSource: QueryResponse<HighchartConfig | KeyFigure> = query({
        query: `_id = '${event.data.nodes[0].id}' AND data.dataSource._selected = '${DataSource.STATBANK_API}'`,
        contentTypes: [`${app.name}:highchart`, `${app.name}:keyFigure`],
        filters: {
          exists: {
            field: `data.dataSource.${DataSource.STATBANK_API}.urlOrId`
          }
        }
      })
      log.info('%s', JSON.stringify(contentWithDataSource, null, 2))
      contentWithDataSource.hits.forEach((content: Content<HighchartConfig | KeyFigure>) => refreshDataset(content))
    }
  })
}

