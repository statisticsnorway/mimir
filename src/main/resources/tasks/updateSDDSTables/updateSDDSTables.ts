import { query, Content } from '/lib/xp/content'
import { JobNames } from '/lib/ssb/repo/job'
import { refreshDatasetsAndUpdateJobLog } from '/lib/ssb/utils/taskUtils'
import { DataSource } from '/site/mixins'

export function run(): void {
  log.info(`Run Task: updateSDDSTables ${new Date()}`)
  refreshDatasetsAndUpdateJobLog(JobNames.REFRESH_DATASET_SDDS_TABLES_JOB, getSDDSTableDataset())
}

function getSDDSTableDataset(): Array<Content<DataSource>> {
  return query({
    start: 0,
    count: 99,
    query: `fulltext('displayName',  'SDDS')`,
    filters: {
      boolean: {
        must: [
          {
            hasValue: {
              field: 'language',
              values: ['en'],
            },
          },
          {
            hasValue: {
              field: 'type',
              values: [`${app.name}:table`],
            },
          },
        ],
      },
    },
  }).hits as unknown as Array<Content<DataSource>>
}
