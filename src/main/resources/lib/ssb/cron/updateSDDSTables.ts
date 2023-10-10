import { query, Content } from '/lib/xp/content'
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
import { cronJobLog } from '/lib/ssb/utils/serverLog'
import { type DataSource } from '/site/mixins/dataSource'

export function updateSDDSTables(): void {
  cronJobLog('Start update SDDS tables job')
  const jobLogNode: JobEventNode = startJobLog(JobNames.REFRESH_DATASET_SDDS_TABLES_JOB)
  const hits: Array<Content<DataSource>> = getSDDSTableDataset()

  if (hits?.length) {
    updateJobLog(jobLogNode._id, (node: JobInfoNode) => {
      node.data = {
        ...node.data,
        queryIds: hits.map((q) => q._id),
      }
      return node
    })

    const jobLogResult: Array<CreateOrUpdateStatus> = hits.map((tableDataSource) => {
      return refreshDataset(tableDataSource, DATASET_BRANCH)
    })

    if (jobLogResult.length === hits.length) {
      completeJobLog(jobLogNode._id, JOB_STATUS_COMPLETE, {
        result: jobLogResult.map((r) => ({
          id: r.dataquery._id,
          displayName: r.dataquery.displayName,
          contentType: r.dataquery.type,
          dataSourceType: r.dataquery.data.dataSource?._selected,
          status: r.status,
        })),
      })
    }
  } else {
    completeJobLog(jobLogNode._id, JOB_STATUS_COMPLETE, {
      result: [],
    })
  }
  cronJobLog(JobNames.REFRESH_DATASET_SDDS_TABLES_JOB)
}

function getSDDSTableDataset(): Array<Content<DataSource>> {
  return query({
    start: 0,
    count: 99,
    query: `fulltext('displayName',  'SDDS')`,
    filters: {
      boolean: {
        must: [
          {
            hasValue: {
              field: 'language',
              values: ['en'],
            },
          },
          {
            hasValue: {
              field: 'type',
              values: [`${app.name}:table`],
            },
          },
        ],
      },
    },
  }).hits as unknown as Array<Content<DataSource>>
}
