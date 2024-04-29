import { updateUnpublishedMockTbml } from '/lib/ssb/dataset/mockUnpublished'

export function run(): void {
  log.info(`Run Task: updateUnpublishedMockTbml ${new Date()}`)
  updateUnpublishedMockTbml()
}
