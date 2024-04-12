import { updateSDDSTables } from '/lib/ssb/cron/updateSDDSTables'

export function run(): void {
  updateSDDSTables()
}
