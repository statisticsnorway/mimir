import { getChildren, Content } from '/lib/xp/content'
import {
  JobEventNode,
  JobInfoNode,
  completeJobLog,
  startJobLog,
  updateJobLog,
  JOB_STATUS_COMPLETE,
  JobNames,
} from '/lib/ssb/repo/job'
import { CreateOrUpdateStatus, refreshDataset } from '/lib/ssb/dataset/dataset'
import { DATASET_BRANCH } from '/lib/ssb/repo/dataset'
import { DataSource } from '/site/mixins'
import { cronJobLog } from '../utils/serverLog'

export function updateFrontpageKeyfigures(): void {
  cronJobLog('Run task update Frontpage Keyfigures')

  const jobLogNode: JobEventNode = startJobLog(JobNames.REFRESH_DATASET_FRONTPAGE_KEYFIGURES_JOB)
  const frontpageKeyfigures = getFrontpageKeyfiguresDataSource()

  if (frontpageKeyfigures?.length) {
    updateJobLog(jobLogNode._id, (node: JobInfoNode) => {
      node.data = {
        ...node.data,
        queryIds: frontpageKeyfigures.map(({ _id }) => _id),
      }
      return node
    })

    const jobLogResult: Array<CreateOrUpdateStatus> = frontpageKeyfigures.map((frontpageKeyfigure) => {
      return refreshDataset(frontpageKeyfigure, DATASET_BRANCH)
    })

    if (jobLogResult.length === frontpageKeyfigures.length) {
      completeJobLog(jobLogNode._id, JOB_STATUS_COMPLETE, {
        result: jobLogResult.map((result) => {
          const { _id, displayName, type, data } = result.dataquery
          return {
            id: _id,
            displayName,
            contentType: type,
            dataSourceType: data?.dataSource?._selected ?? '',
            status: result.status,
          }
        }),
      })
    }
  } else {
    completeJobLog(jobLogNode._id, JOB_STATUS_COMPLETE, {
      result: [],
    })
  }
  cronJobLog(JobNames.REFRESH_DATASET_FRONTPAGE_KEYFIGURES_JOB)
}

export function getFrontpageKeyfiguresDataSource(): Array<Content<DataSource>> {
  const frontpageKeyfiguresNo = getChildren({
    key: '/ssb/nokkeltall-forside',
    start: 0,
    count: 10,
  }).hits

  const frontpageKeyfiguresEn = getChildren({
    key: '/ssb/en/nokkeltall-forside-en',
    start: 0,
    count: 10,
  }).hits

  return [...frontpageKeyfiguresNo, ...frontpageKeyfiguresEn]
}
