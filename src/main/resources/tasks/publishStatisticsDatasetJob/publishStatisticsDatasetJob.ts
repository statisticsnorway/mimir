import { publishDataset } from '/lib/ssb/dataset/publishOld'

export function run(): void {
  log.info(`Run Task: publishJob ${new Date()}`)
  publishDataset()
}
