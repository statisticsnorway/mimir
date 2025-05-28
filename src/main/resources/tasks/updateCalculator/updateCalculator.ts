import { CreateOrUpdateStatus } from '/lib/ssb/dataset/dataset'
import { JobNames } from '/lib/ssb/repo/job'

import { getAllCalculatorDataset } from '/lib/ssb/dataset/calculator'
import { clearPartFromPartCache } from '/lib/ssb/cache/partCache'
import { refreshDatasetsForTask } from '/lib/ssb/utils/taskUtils'

export function run(): void {
  log.info(`Run Task: updateCalculatorData ${new Date()}`)
  refreshDatasetsForTask(JobNames.REFRESH_DATASET_CALCULATOR_JOB, getAllCalculatorDataset(), clearCalculatorPartsCache)
}

function clearCalculatorPartsCache(jobLogResult: Array<CreateOrUpdateStatus>): void {
  const updatedDataquery: number = jobLogResult.filter((job) => job.status === 'GET_DATA_COMPLETE').length

  if (updatedDataquery > 0) {
    log.info(`Clearing part cache for ${updatedDataquery} updated calculators`)
    clearPartFromPartCache('kpiCalculator')
    clearPartFromPartCache('pifCalculator')
    clearPartFromPartCache('bkibolCalculator')
    clearPartFromPartCache('husleieCalculator')
  }
}
