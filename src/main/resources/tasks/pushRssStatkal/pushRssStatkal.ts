import { JobEventNode } from '/lib/ssb/repo/job'
import { pushRssStatkal } from '/lib/ssb/cron/pushRss'
import { completeJobLog, startJobLog, JobNames } from '/lib/ssb/repo/job'
import { cronJobLog } from '/lib/ssb/utils/serverLog'

exports.run = function (): void {
  log.info(`Run Task pushRss Statkal: ${new Date()}`)
  const jobLogNode: JobEventNode = startJobLog(JobNames.PUSH_RSS_STATKAL)
  const result: string = pushRssStatkal()
  completeJobLog(jobLogNode._id, result, {
    result,
  })
  cronJobLog(JobNames.PUSH_RSS_STATKAL)
}
