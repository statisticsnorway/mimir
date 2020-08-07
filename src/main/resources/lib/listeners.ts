import { Content, QueryResponse } from 'enonic-types/lib/content'
import { HighchartConfig } from '../site/macros/highchart/highchart-config'
import { KeyFigure } from '../site/content-types/keyFigure/keyFigure'
import { EnonicEvent } from 'enonic-types/lib/event'
import {DatasetRepoNode} from "./repo/dataset";
import {JSONstat} from "./types/jsonstat-toolkit";
import {TbmlData} from "./types/xmlParser";
import {CreateOrUpdateStatus} from "./ssb/dataset/dataset";

const {
  getDataset
} = __non_webpack_require__( './ssb/dataset/dataset')
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
      log.info('WHAT DID YOU FIND? what? ...WHAT?')
      log.info('%s', JSON.stringify(contentWithDataSource, null, 2))
      contentWithDataSource.hits.forEach((content: Content<HighchartConfig | KeyFigure>) => {
        log.info('this content have this in repo:::\n\n')
        const repoData: DatasetRepoNode<JSONstat | TbmlData> | null = getDataset(content)
        log.info('%s', JSON.stringify(repoData, null, 2))
        log.info('refresh data')
        const refreshresult: CreateOrUpdateStatus = refreshDataset(content)
        log.info('%s', JSON.stringify(refreshresult, null, 2))
      })
    }
  })
}

