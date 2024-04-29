import { clearPartFromPartCache } from '/lib/ssb/cache/partCache'

export function run(): void {
  log.info(`Run Task: clearCalculatorPartsCache ${new Date()}`)
  clearPartFromPartCache('kpiCalculator')
  clearPartFromPartCache('pifCalculator')
  clearPartFromPartCache('bkibolCalculator')
  clearPartFromPartCache('husleieCalculator')
}
