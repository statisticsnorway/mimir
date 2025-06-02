import { JobNames } from '/lib/ssb/repo/job'

import { getAllCalculatorDataset } from '/lib/ssb/dataset/calculator'
import { clearPartFromPartCache } from '/lib/ssb/cache/partCache'
import { refreshDatasetsForTask } from '/lib/ssb/utils/taskUtils'

export function run(): void {
  log.info(`Run Task: updateCalculatorData ${new Date()}`)
  refreshDatasetsForTask(JobNames.REFRESH_DATASET_CALCULATOR_JOB, getAllCalculatorDataset(), clearCalculatorPartsCache)
}

function clearCalculatorPartsCache(totalUpdatedDataqueries: number): void {
  log.info(`Clearing part cache for ${totalUpdatedDataqueries} updated calculators`)
  clearPartFromPartCache('kpiCalculator')
  clearPartFromPartCache('pifCalculator')
  clearPartFromPartCache('bkibolCalculator')
  clearPartFromPartCache('husleieCalculator')
}
