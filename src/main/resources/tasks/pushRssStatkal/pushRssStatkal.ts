import { JobEventNode, completeJobLog, startJobLog, JobNames } from '/lib/ssb/repo/job'
import { pushRssStatkal } from '/lib/ssb/cron/pushRss'
import { cronJobLog } from '/lib/ssb/utils/serverLog'

export function run(): void {
  log.info(`Run Task: pushRssStatkal ${new Date()}`)
  const jobLogNode: JobEventNode = startJobLog(JobNames.PUSH_RSS_STATKAL)
  const result = pushRssStatkal()
  completeJobLog(jobLogNode._id, result.message, { status: result?.status })
  cronJobLog(JobNames.PUSH_RSS_STATKAL)
}
