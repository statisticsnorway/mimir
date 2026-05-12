import { deleteExpiredEventLogsForQueries, deleteExpiredEventLogsForJobs } from '/lib/ssb/cron/eventLog'
import { isEnabled } from '/lib/featureToggle'

export function run(): void {
  log.info(`Run Task: deleteExpiredEventLog ${new Date()}`)
  deleteExpiredEventLogsForQueries()

  if (isEnabled('delete-joblog-cron', false, 'ssb')) {
    deleteExpiredEventLogsForJobs()
  }
}
