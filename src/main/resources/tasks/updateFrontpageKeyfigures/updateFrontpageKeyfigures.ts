import { updateFrontpageKeyfigures } from '/lib/ssb/cron/updateFrontpageKeyfigures'

export function run(): void {
  log.info(`Run Task: updateFrontpageKeyfigures ${new Date()}`)
  updateFrontpageKeyfigures()
}
