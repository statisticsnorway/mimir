import { migrateStatisticsContentTypeWithShortname } from '/lib/ssb/statreg/migrateStatisticsContentTypeWithShortname'

export function run(): void {
  log.info(`Run Task: updateStatisticsContentTypeWithShortname ${new Date()}`)
  migrateStatisticsContentTypeWithShortname()
}
