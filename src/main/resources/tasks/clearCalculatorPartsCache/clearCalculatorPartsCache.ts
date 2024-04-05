import { clearPartFromPartCache } from '/lib/ssb/cache/partCache'

export function run(): void {
  clearPartFromPartCache('kpiCalculator')
  clearPartFromPartCache('pifCalculator')
  clearPartFromPartCache('bkibolCalculator')
  clearPartFromPartCache('husleieCalculator')
}