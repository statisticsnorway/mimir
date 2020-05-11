import { getNode, withLoggedInUserContext } from '../../lib/repo/common'

const auth = __non_webpack_require__( '/lib/xp/auth')
const context = __non_webpack_require__( '/lib/xp/context')
const content = __non_webpack_require__( '/lib/xp/content')
const {
  getData, refreshDatasetWithData
} = __non_webpack_require__('/lib/dataquery')
const {
  getAllOrOneDataQuery
} = __non_webpack_require__('/lib/ssb/dataquery')
const {
  getAllOrOneDataSet
} = __non_webpack_require__( '/lib/ssb/dataset')
const {
  Events, logDataQueryEvent
} = __non_webpack_require__('/lib/repo/query')
const i18n = __non_webpack_require__('/lib/xp/i18n')
const {
  dateToFormat, dateToReadable
} = __non_webpack_require__( '/lib/ssb/utils')
const {
  EVENT_LOG_BRANCH, EVENT_LOG_REPO
} = __non_webpack_require__( '/lib/repo/eventLog')

/**
 *
 * @param {object} req
 * @return {{body: {success: boolean, message: string}, contentType: string, status: number}|
 * {body: {publishResult: *, updates: *, message: *}, contentType: string, status: number}}
 */
exports.get = function(req) {
  if (!req.params || !req.params.id) {
    return missingParameterResponse()
  }

  const updateResult = withLoggedInUserContext('master', (user) => {
    logDataQueryEvent(req.params.id, user, {
      message: Events.STARTED
    })
    return getAllOrOneDataQuery(req.params.id.map((dataquery) =>
      updateDataQuery(dataquery, user)))
  })


  const parsedResult = updateResult.map( (result) => { // refreshResult
    const queryLogNode = getNode(EVENT_LOG_REPO, EVENT_LOG_BRANCH, `/queries/${result.dataquery._id}`)
    return {
      id: result.dataquery._id,
      message: i18n.localize({
        key: result.status
      }),
      status: result.status,
      dataset: {
        modified: dateToFormat(result.modified),
        modifiedReadable: dateToReadable(result.modified)
      },
      logData: {
        ...queryLogNode.data,
        message: i18n.localize({
          key: result.status
        }),
        modified: dateToFormat(queryLogNode.modified),
        modifiedReadable: dateToReadable(queryLogNode.modified)
      }
    }
  })

  return successResponse(parsedResult, undefined)
}

/**
 *
 * @param {object} req
 * @return {{body: {success: boolean, message: string}, contentType: string, status: number}|
 * {body: {publishResult: *, updates: *, message: *}, contentType: string, status: number}}
 */
exports.delete = (req) => {
  if (!req.params || !req.params.id) {
    return missingParameterResponse()
  }
  const user = auth.getUser()
  const deleteResult = context.run(createContextOption('draft'), () => {
    logDataQueryEvent(req.params.id, user, {
      message: Events.START_DELETE
    })
    return getAllOrOneDataSet(req.params.id).map((dataset) => {
      return {
        dataset,
        deleted: content.delete({
          key: dataset._id
        })
      }
    })
  })

  if (deleteResult.length === 0) {
    logDataQueryEvent(req.params.id, user, {
      message: Events.DELETE_FAILED,
      deleteResult
    })
    return successResponse(deleteResult, undefined)
  }

  logDataQueryEvent(req.params.id, user, {
    message: Events.DELETE_OK,
    deleteResult
  })

  const publishResult = content.publish({
    keys: deleteResult.map((result) => result.dataset._id),
    sourceBranch: 'draft',
    targetBranch: 'master'
  })

  publishResult.deletedContents.forEach((id) => {
    logDataQueryEvent(id, user, {
      message: Events.DELETE_OK_PUBLISHED,
      deleteResult
    })
  })

  publishResult.failedContents.forEach((id) => {
    logDataQueryEvent(id, user, {
      message: Events.DELETE_FAILED_PUBLISHED,
      deleteResult
    })
  })

  const updateResult = deleteResult.map( (result) => { // refreshResult
    const queryLogNode = getNode(EVENT_LOG_REPO, EVENT_LOG_BRANCH, `/queries/${result.dataset.data.dataquery}`)
    return {
      id: result.dataset.data.dataquery,
      message: queryLogNode.data.modifiedResult ? i18n.localize({
        key: queryLogNode.data.modifiedResult
      }) : undefined,
      status: queryLogNode.data.modifiedResult,
      dataset: {
        isDeleted: true,
        modified: '',
        modifiedReadable: ''
      },
      logData: {
        ...queryLogNode.data,
        message: i18n.localize({
          key: queryLogNode.data.modifiedResult
        }),
        modified: dateToFormat(queryLogNode.modified),
        modifiedReadable: dateToReadable(queryLogNode.modified)
      }
    }
  })

  return successResponse(updateResult, publishResult)
}

/**
 *
 * @param {object} updateResult
 * @param {object} publishResult
 * @return {{body: {publishResult: *, updates: *, message: *}, contentType: string, status: number}}
 */
function successResponse(updateResult, publishResult) {
  return {
    body: {
      updates: updateResult,
      message: createMessage(updateResult),
      publishResult
    },
    contentType: 'application/json',
    status: 200
  }
}

/**
 *
 * @return {{body: {success: boolean, message: string}, contentType: string, status: number}}
 */
function missingParameterResponse() {
  return {
    body: {
      success: false,
      message: `Missing parameter "id"`
    },
    contentType: 'application/json',
    status: 400
  }
}

/**
 *
 * @param {object }updateResult
 * @return {string|string|"NOT_TRANSLATED"}
 */
function createMessage(updateResult) {
  if (updateResult.length === 1) {
    return i18n.localize({
      key: updateResult[0].status
    })
  }

  return `Updated/created: ${
    updateResult.filter( (result) => result.status === Events.COMPLETE).length
  } - Ignored: ${
    updateResult.filter( (result) => result.status === Events.NO_NEW_DATA).length
  } - Failed:  ${
    updateResult.filter( (result) => result.status === Events.FAILED_TO_FIND_DATAQUERY ||
        result.status === Events.FAILED_TO_GET_DATA
    ).length
  } - Total: ${
    updateResult.length
  }`
}

/**
 *
 * @param {object } dataquery
 * @param {object } user
 * @return {{dataquery: *, message: *}|{refreshResult: *, message: *}}
 */
function updateDataQuery(dataquery, user) {
  if (!dataquery) {
    return {
      dataquery,
      status: Events.FAILED_TO_FIND_DATAQUERY
    }
  }

  const data = getData(dataquery)
  if (!data) {
    logDataQueryEvent(dataquery._id, user, {
      message: Events.FAILED_TO_GET_DATA
    } )
    return {
      dataquery,
      status: Events.FAILED_TO_GET_DATA
    }
  }

  const refreshDatasetResult = refreshDatasetWithData(JSON.stringify(data), dataquery) // returns a dataset and status
  logDataQueryEvent(dataquery._id, user, {
    message: refreshDatasetResult.status
  })
  return {
    dataquery,
    status: refreshDatasetResult.status // can be failed to fetch data or failed to
  }
}


const createContextOption = (branch) => {
  const _user = auth.getUser()
  const user = {
    login: _user.login,
    userStore: _user.idProvider
  }

  const contextOption = {
    repository: 'com.enonic.cms.default',
    principals: ['role:system.admin'],
    branch,
    user
  }

  return contextOption
}
