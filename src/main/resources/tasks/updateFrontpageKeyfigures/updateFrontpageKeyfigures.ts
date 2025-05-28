import { getChildren, Content } from '/lib/xp/content'
import { JobNames } from '/lib/ssb/repo/job'
import { refreshDatasetsForTask } from '/lib/ssb/utils/taskUtils'
import { DataSource } from '/site/mixins'

export function run(): void {
  log.info(`Run Task: updateFrontpageKeyfigures ${new Date()}`)
  refreshDatasetsForTask(JobNames.REFRESH_DATASET_FRONTPAGE_KEYFIGURES_JOB, getFrontpageKeyfiguresDataSource())
}

function getFrontpageKeyfiguresDataSource(): Array<Content<DataSource>> {
  const frontpageKeyfiguresNo = getChildren({
    key: '/ssb/nokkeltall-forside',
    start: 0,
    count: 10,
  }).hits

  const frontpageKeyfiguresEn = getChildren({
    key: '/ssb/en/nokkeltall-forside-en',
    start: 0,
    count: 10,
  }).hits

  return [...frontpageKeyfiguresNo, ...frontpageKeyfiguresEn]
}
