import { createOrUpdateStatisticsRepo } from '/lib/ssb/repo/statisticVariant'

export function run(): void {
  log.info(`Run Task: updateStatisticRepo ${new Date()}`)
  createOrUpdateStatisticsRepo()
}
