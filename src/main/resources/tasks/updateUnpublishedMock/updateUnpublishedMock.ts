import { updateUnpublishedMockTbml } from '/lib/ssb/dataset/mockUnpublished'

// const updateUnpublishedMockCron: string =
// app.config && app.config['ssb.cron.updateUnpublishedMock']
//   ? app.config['ssb.cron.updateUnpublishedMock']
//   : '0 04 * * *'

export function run(): void {
  updateUnpublishedMockTbml
}