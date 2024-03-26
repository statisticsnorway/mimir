import { deleteExpiredEventLogsForQueries } from '/lib/ssb/cron/eventLog'

export function run(): void {
  deleteExpiredEventLogsForQueries()
}
