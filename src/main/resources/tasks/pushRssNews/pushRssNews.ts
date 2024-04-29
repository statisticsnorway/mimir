import { type JobEventNode, completeJobLog, startJobLog, JobNames } from '/lib/ssb/repo/job'
import { pushRssNews } from '/lib/ssb/cron/pushRss'

export function run(): void {
  log.info(`Run Task: pushRssNews ${new Date()}`)
  const jobLogNode: JobEventNode = startJobLog(JobNames.PUSH_RSS_NEWS)
  const result: string = pushRssNews()
  completeJobLog(jobLogNode._id, result, {
    result,
  })
}
