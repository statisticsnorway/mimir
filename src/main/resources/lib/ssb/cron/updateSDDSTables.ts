import { JobEventNode, JobInfoNode } from '/lib/ssb/repo/job'
import { CreateOrUpdateStatus } from '/lib/ssb/dataset/dataset'
import type { GenericDataImport } from '/site/content-types'
import { query, Content } from '/lib/xp/content'
import { DATASET_BRANCH } from '/lib/ssb/repo/dataset'

const { completeJobLog, startJobLog, updateJobLog, JOB_STATUS_COMPLETE, JobNames } =
  __non_webpack_require__('/lib/ssb/repo/job')
const { cronJobLog } = __non_webpack_require__('/lib/ssb/utils/serverLog')
const { refreshDataset } = __non_webpack_require__('/lib/ssb/dataset/dataset')
const { clearPartFromPartCache } = __non_webpack_require__('/lib/ssb/cache/partCache')

export function updateSDDSTables(): void {
  cronJobLog('Start update SDDS tables job')
  const jobLogNode: JobEventNode = startJobLog(JobNames.REFRESH_DATASET_SDDS_TABLES_JOB)
  const dataSources: Array<Content<GenericDataImport>> = getSDDSTableDataset()

  if (dataSources && dataSources.length > 1) {
    updateJobLog(jobLogNode._id, (node: JobInfoNode) => {
      node.data = {
        ...node.data,
        queryIds: dataSources.map((q) => q._id),
      }
      return node
    })

    const jobLogResult: Array<CreateOrUpdateStatus> = dataSources.map((datasource) => {
      return refreshDataset(datasource, DATASET_BRANCH)
    })

    if (jobLogResult.length === dataSources.length) {
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

    const updatedDataquery: number = jobLogResult.filter((job) => job.status === 'GET_DATA_COMPLETE').length

    if (updatedDataquery > 0) {
      clearPartFromPartCache('kpiCalculator')
      clearPartFromPartCache('pifCalculator')
      clearPartFromPartCache('bkibolCalculator')
      clearPartFromPartCache('husleieCalculator')
    }
  } else {
    completeJobLog(jobLogNode._id, JOB_STATUS_COMPLETE, {
      result: [],
    })
  }
}

function getSDDSTableDataset(): Array<Content<GenericDataImport>> {
  return query({
    start: 0,
    count: 10, // TODO: Exact number?
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
  }).hits as unknown as Array<Content<GenericDataImport>>
}
