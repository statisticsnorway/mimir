import {libScheduleTestLog, libScheduleTest} from '/lib/ssb/cron/cron'
import {
  type JobEventNode,
  completeJobLog,
  startJobLog,
  JobNames,
} from '/lib/ssb/repo/job'
import { pushRssNews } from '/lib/ssb/cron/pushRss'

const pushRssNewsCron: string = app.config && app.config['ssb.cron.pushRssNews'] ? app.config['ssb.cron.pushRssNews'] : '02 06 * * *'

export function run(): void {
  libScheduleTestLog('pushRssNewsCronTest', pushRssNewsCron)

  const jobLogNode: JobEventNode = startJobLog(JobNames.PUSH_RSS_NEWS)
  const result: string = pushRssNews()
  completeJobLog(jobLogNode._id, result, {
    result,
  })

  libScheduleTest({ name: 'pushRssNewsCronTest', cron: '01 08 * * *', timeZone: 'Europe/Oslo' }, pushRssNewsCron)
}