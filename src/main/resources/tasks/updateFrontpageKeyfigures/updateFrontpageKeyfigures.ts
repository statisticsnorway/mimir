import { query, Content } from '/lib/xp/content'
import { JobNames } from '/lib/ssb/repo/job'
import { refreshDatasetsForTask } from '/lib/ssb/utils/taskUtils'
import { DataSource } from '/site/mixins'

export function run(): void {
  log.info(`Run Task: updateFrontpageKeyfigures ${new Date()}`)
  refreshDatasetsForTask(JobNames.REFRESH_DATASET_FRONTPAGE_KEYFIGURES_JOB, getFrontpageKeyfiguresDataSource())
}

function getFrontpageKeyfiguresDataSource(): Array<Content<DataSource>> {
  return query({
    start: 0,
    count: 20,
    query: `fulltext('displayName',  'forside')`,
    filters: {
      boolean: {
        must: [
          {
            hasValue: {
              field: 'language',
              values: ['en', 'nb'],
            },
          },
          {
            hasValue: {
              field: 'type',
              values: [`${app.name}:keyFigure`],
            },
          },
        ],
      },
    },
  }).hits as unknown as Array<Content<DataSource>>
}
