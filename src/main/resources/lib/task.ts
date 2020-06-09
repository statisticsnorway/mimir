import { Content, QueryResponse } from 'enonic-types/lib/content'
import { Dataquery } from '../site/content-types/dataquery/dataquery'
import { splitEvery } from 'ramda'
import {withSuperUserContext} from "./repo/common";
import {EVENT_LOG_BRANCH, EVENT_LOG_REPO} from "./repo/eventLog";
import {User} from "enonic-types/lib/auth";
const {
  refreshDataset
} = __non_webpack_require__('/lib/dataquery')
const { run } = __non_webpack_require__('/lib/xp/context')

const {
  progress,
  submit
} = __non_webpack_require__('/lib/xp/task')

const user: object = {
  login: 'su',
  userStore: 'system'
}

const master: object = { // Master context (XP)
  repository: 'com.enonic.cms.default',
  branch: 'master',
  principals: ['role:system.admin'],
  user
}

export function asynchronusRefreshRows(httpQueries: QueryResponse<Dataquery>, numberOfAsyncronusJobs: number = 4): Array<string> {
  const chunksOfRows: Array<Array<Content<Dataquery>>> = splitEvery(numberOfAsyncronusJobs, httpQueries.hits)
  return chunksOfRows.map( (rows: Array<Content<Dataquery>>) => {
    return submit({
      description: `RefreshRows`,
      task: function() {
        progress({info: `Start task for datasets ${rows.map((row) => row._id)}`})
        rows.map((row: Content<Dataquery>) => {
          progress({info: `Refresh dataset ${row._id}`})
          refreshDataset(row)
        })
      }
    })
  })
}
