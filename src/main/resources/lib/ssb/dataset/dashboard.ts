import { Socket } from '../../convert/convert'
import { DatasetLib, CreateOrUpdateStatus } from './dataset'
import { ContentLibrary, Content } from 'enonic-types/lib/content'
import { DataSource } from '../../../site/mixins/dataSource/dataSource'
import { logUserDataQuery, Events } from '../../repo/query'
import { getNode } from '../../repo/common'
import { EVENT_LOG_REPO, EVENT_LOG_BRANCH } from '../../repo/eventLog'
import { RepoNode } from 'enonic-types/lib/node'
import { I18nLibrary } from 'enonic-types/lib/i18n'

const {
  refreshDataset
}: DatasetLib = __non_webpack_require__( '/lib/ssb/dataset/dataset')
const {
  get: getContent
}: ContentLibrary = __non_webpack_require__( '/lib/xp/content')
const {
  dateToFormat, dateToReadable
} = __non_webpack_require__( '/lib/ssb/utils')
const i18n: I18nLibrary = __non_webpack_require__('/lib/xp/i18n')

export function setupHandlers(socket: Socket): void {
  socket.on('dashboard-refresh', (options: RefreshDatasetOptions) => {
    // NOTE THIS IS UNTESTED AND JUST EXAMPLE CODE
    options.ids.forEach((id: string) => {
      const dataSource: Content<DataSource> | null = getContent({
        key: id
      })
      if (dataSource) {
        const refreshDatasetResult: CreateOrUpdateStatus = refreshDataset(dataSource, true)
        logUserDataQuery(dataSource._id, {
          message: refreshDatasetResult.status
        })
        socket.emit('dashboard-refresh-result', transfromQueryResult(refreshDatasetResult))
      } else {
        socket.emit('dashboard-refresh-result', {
          id: id,
          message: i18n.localize({
            key: Events.FAILED_TO_FIND_DATAQUERY
          }),
          status: Events.FAILED_TO_FIND_DATAQUERY
        })
      }
    })
  })
}

function transfromQueryResult(result: CreateOrUpdateStatus): DashboardRefreshResult {
  const nodes: QueryLogNode | readonly QueryLogNode[] | null = getNode(EVENT_LOG_REPO, EVENT_LOG_BRANCH, `/queries/${result.dataquery._id}`)
  let queryLogNode: QueryLogNode | null = null
  if (nodes) {
    if (Array.isArray(nodes)) {
      queryLogNode = nodes[0]
    } else {
      queryLogNode = nodes as QueryLogNode
    }
  }
  return {
    id: result.dataquery._id,
    message: i18n.localize({
      key: result.status
    }),
    status: result.status,
    dataset: result.dataset ? {
      newDatasetData: result.newDatasetData ? result.newDatasetData : false,
      modified: dateToFormat(result.dataset._ts),
      modifiedReadable: dateToReadable(result.dataset._ts)
    } : {},
    logData: queryLogNode ? {
      ...queryLogNode.data,
      message: i18n.localize({
        key: queryLogNode.data.modifiedResult
      }),
      modified: queryLogNode.data.modified,
      modifiedReadable: dateToReadable(queryLogNode.data.modifiedTs)
    } : {}
  }
}

interface QueryLogNode extends RepoNode {
  data: {
    queryId: string;
    modified: string;
    modifiedResult: string;
    modifiedTs: string;
    by: {
      type: string;
      key: string;
      displayName: string;
      disabled: boolean;
      email: string;
      login: string;
      idProvider: string;
    };
  };
}

interface DashboardRefreshResult {
  id: string;
  message: string;
  status: string;
  dataset: DashboardRefreshResultDataset | {};
  logData: DashboardRefreshResultLogData | {};
}

interface DashboardRefreshResultDataset {
  newDatasetData: boolean;
  modified: string;
  modifiedReadable: string;
}

interface DashboardRefreshResultLogData {
  message: string;
  modified: string;
  modifiedReadable: string;
}


export interface RefreshDatasetOptions {
  ids: Array<string>;
}
