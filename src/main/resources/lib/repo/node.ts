import { NodeLibrary, RepoConnection } from 'enonic-types/lib/node'
import { ContextLibrary } from 'enonic-types/lib/context'

const node: NodeLibrary = __non_webpack_require__('/lib/xp/node')
const context: ContextLibrary = __non_webpack_require__('/lib/xp/context')

const LOG_REPO_ID: string = 'no.ssb.datarequestlog'
const LOG_BRANCH_NAME: string = 'master'

export function createConnectionInContext(): RepoConnection {
  return context.run({
    repository: LOG_REPO_ID,
    branch: LOG_BRANCH_NAME,
    user: {
      login: 'su',
      idProvider: 'system'
    }
  }, function() {
    return node.connect({
      repoId: LOG_REPO_ID,
      branch: LOG_BRANCH_NAME
    })
  })
}

export function createNodeInContext(content: object) {
  const connection: RepoConnection = createConnectionInContext()
  return context.run({
    repository: LOG_REPO_ID,
    branch: LOG_BRANCH_NAME,
    user: {
      login: 'su',
      idProvider: 'system'
    }
  }, function() {
    return connection.create(content)
  })
}

export function getNodeInContext(nodeId: string): object{
  const connection: RepoConnection = createConnectionInContext()
  return context.run({
      repository: LOG_REPO_ID,
      branch: LOG_BRANCH_NAME,
      user: {
        login: 'su',
        idProvider: 'system'
      }
  },
function() {
    return connection.get(nodeId);
  })
}

export interface LogNodeResponse {
  success: boolean;
  message: string;
  status: number;
}

