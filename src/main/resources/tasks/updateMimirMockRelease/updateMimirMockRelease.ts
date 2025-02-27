import { updateMimirMockRelease } from '/lib/ssb/repo/statreg'

export function run(): void {
  log.info(`Run Task: updateMimirMockRelease ${new Date()}`)
  updateMimirMockRelease()
}
