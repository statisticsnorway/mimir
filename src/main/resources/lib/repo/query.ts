import { Content } from 'enonic-types/lib/content'
import { Dataquery } from '../../site/content-types/dataquery/dataquery'
import { NodeQueryResponse, RepoNode } from 'enonic-types/lib/node'
import { JobInfo } from './job'
import { withConnection } from './common'
import { UtilLibrary } from '../types/util'
import { EVENT_LOG_BRANCH, EVENT_LOG_REPO, createEventLog } from './eventLog'

const util: UtilLibrary = __non_webpack_require__( '/lib/util')

export interface QueryInfo extends RepoNode {
  queryId: string;
  jobs: Array<JobInfo>;
}

export function createQueryNode(dataquery: Content<Dataquery>, job: JobInfo): object {
  return createEventLog({
    _parentPath: '/queries',
    queryId: dataquery._id,
    jobs: [{
      id: job._id,
      ...job
    }]
  })
}

export function updateQuery(dataqueryId: string, job: JobInfo): QueryInfo {
  return withConnection<QueryInfo>(EVENT_LOG_REPO, EVENT_LOG_BRANCH, (conn) => {
    return conn.modify({
      key: dataqueryId,
      editor: (node: QueryInfo) => {
        return {
          ...node,
          jobs: [
            ...(util.data.forceArray(node.jobs) as Array<JobInfo>),
            job
          ]
        }
      }
    })
  })
}

export function startQuery(dataQuery: Content<Dataquery>, job: JobInfo): void {
  withConnection(EVENT_LOG_REPO, EVENT_LOG_BRANCH, (conn) => {
    const queryResult: NodeQueryResponse = conn.query({
      count: 1,
      query: `queryId = '${dataQuery._id}`
    })
    if (queryResult.total === 1) {
      updateQuery(queryResult.hits[0].id, job)
    } else {
      createQueryNode(dataQuery, job)
    }
  })
}

