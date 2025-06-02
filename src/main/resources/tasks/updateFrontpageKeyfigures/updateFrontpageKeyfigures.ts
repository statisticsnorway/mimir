import { query, Content, get as getContentByKey } from '/lib/xp/content'
import { JobNames } from '/lib/ssb/repo/job'
import { refreshDatasetsForTask } from '/lib/ssb/utils/taskUtils'
import { DataSource } from '/site/mixins'
import { purgePageFromVarnish } from '../banVarnishPageCache/banVarnishPageCache'

export function run(): void {
  log.info(`Run Task: updateFrontpageKeyfigures ${new Date()}`)
  refreshDatasetsForTask(
    JobNames.REFRESH_DATASET_FRONTPAGE_KEYFIGURES_JOB,
    getFrontpageKeyfiguresDataSource(),
    clearFrontpageVarnishCache
  )
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
              values: ['nb', 'en'],
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

function getFrontpageIds(): string[] {
  const frontpageNb =
    getContentByKey({
      key: '/ssb',
    })?._id ?? ''

  const frontpageEn =
    getContentByKey({
      key: '/ssb/en/',
    })?._id ?? ''

  return [frontpageNb, frontpageEn]
}

function clearFrontpageVarnishCache(): void {
  const pageIds: string[] = getFrontpageIds()
  pageIds.map((pageId) => purgePageFromVarnish(pageId))
}
