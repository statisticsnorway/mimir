import { clearPartFromPartCache } from '/lib/ssb/cache/partCache'
import {libScheduleTestLog, libScheduleTest} from '/lib/ssb/cron/cron'


  // clear calculator parts cache cron
  const clearCalculatorPartsCacheCron: string =
    app.config && app.config['ssb.cron.clearCalculatorCache']
      ? app.config['ssb.cron.clearCalculatorCache']
      : '15 07 * * *'

export function run(): void {
  libScheduleTestLog('clearCalculatorCronTest', clearCalculatorPartsCacheCron)
  clearPartFromPartCache('kpiCalculator')
  clearPartFromPartCache('pifCalculator')
  clearPartFromPartCache('bkibolCalculator')
  clearPartFromPartCache('husleieCalculator')
  
  libScheduleTest(
    { name: 'clearCalculatorCronTest', cron: '15 08 * * *', timeZone: 'Europe/Oslo' },
    clearCalculatorPartsCacheCron
  )
}