import { updateSDDSTables } from '/lib/ssb/cron/updateSDDSTables'

export function run(): void {
  log.info(`Run Task: updateSDDSTables ${new Date()}`)
  updateSDDSTables()
}
