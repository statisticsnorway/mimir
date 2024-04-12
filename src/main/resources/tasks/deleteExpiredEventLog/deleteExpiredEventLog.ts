import { deleteExpiredEventLogsForQueries } from '/lib/ssb/cron/eventLog'

export function run(): void {
  log.info(`Run Task: deleteExpiredEventLog ${new Date()}`)
  deleteExpiredEventLogsForQueries()
}
