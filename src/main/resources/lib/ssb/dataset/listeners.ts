import { Content, ContentLibrary, QueryResponse } from 'enonic-types/content'
import { HighchartConfig } from '../../../site/macros/highchart/highchart-config'
import { KeyFigure } from '../../../site/content-types/keyFigure/keyFigure'
import { Table } from '../../../site/content-types/table/table'
import { EnonicEvent, EnonicEventData, EventLibrary } from 'enonic-types/event'
import { SSBCronLib } from '../cron/cron'
import { RepoDatasetLib } from '../repo/dataset'
import { DatasetLib } from './dataset'
import { DataSource } from '../../../site/mixins/dataSource/dataSource'
import { RepoCommonLib } from '../repo/common'

const {
  listener
}: EventLibrary = __non_webpack_require__('/lib/xp/event')
const {
  query
}: ContentLibrary = __non_webpack_require__('/lib/xp/content')
const {
  refreshDataset
}: DatasetLib = __non_webpack_require__( '/lib/ssb/dataset/dataset')
const {
  runOnMasterOnly
}: SSBCronLib = __non_webpack_require__('/lib/ssb/cron/cron')
const {
  DataSource: DataSourceType
}: RepoDatasetLib = __non_webpack_require__( '/lib/ssb/repo/dataset')
const {
  ENONIC_CMS_DEFAULT_REPO
}: RepoCommonLib = __non_webpack_require__('/lib/repo/common')

export function setupFetchDataOnCreateListener(): void {
  listener({
    type: 'node.updated',
    callback: function(event: EnonicEvent) {
      runOnMasterOnly(() => {
        const nodes: EnonicEventData['nodes'] = event.data.nodes.filter((n) => n.repo === ENONIC_CMS_DEFAULT_REPO )
        if (nodes.length > 0) {
          const contentWithDataSource: QueryResponse<HighchartConfig | KeyFigure | Table> = query({
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
          contentWithDataSource.hits.forEach((content: Content<DataSource>) => refreshDataset(content))
        }
      })
    }
  })
}

