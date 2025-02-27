import { LibSchedulerTester } from './'

export function run(params: LibSchedulerTester): void {
  log.info(
    `libSchedulerTester - schedule - ${params.name} was set to run at ${params.cron} in timezone 
    ${params.timeZone} 
    and is running at ${new Date()}. CronJob was set to run at ${params.cronLibCron}`
  )
}
