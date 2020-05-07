import {getNode} from '../../lib/repo/common';

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
  getAllOrOneDataSet,
} = __non_webpack_require__( '/lib/ssb/dataset')
const {
  Events, logDataQueryEvent
} = __non_webpack_require__('/lib/repo/query')
const i18n = __non_webpack_require__('/lib/xp/i18n')
const {
  dateToFormat, dateToReadable
} = __non_webpack_require__( '/lib/ssb/utils')


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
  const user = auth.getUser()
  logDataQueryEvent(req.params.id, user, {message:Events.STARTED })

  const updateResult = context.run(createContextOption('master'), () => {
    return getAllOrOneDataQuery(req.params.id).map((dataquery) => updateDataQuery(dataquery, user) )
  })

  const parsedResult = updateResult.map( (result) => {
    const queryLogNode = getNode(`/queries/${result.dataquery._id}`)
    return {
      id: result.dataquery._id,
      message: i18n.localize({key: result.message}),
      status: result.message,
      logData: {
        ...queryLogNode.data,
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

  const deleteResult = context.run(createContextOption('draft'), () => {
    return getAllOrOneDataSet(req.params.id).map((dataquery) => {
      return {
        dataquery,
        deleted: content.delete({
          key: getDataSetWithDataQueryId(dataquery._id)._id
        })
      }
    })
  })

  const publishResult = content.publish({
    keys: deleteResult.map((dataset) => dataset.datasetId),
    sourceBranch: 'draft',
    targetBranch: 'master'
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
    updateResult.filter( (result) => result.status === UpdateResult.COMPLETE).length
  } - Ignored: ${
    updateResult.filter( (result) => result.status === UpdateResult.NO_NEW_DATA).length
  } - Failed:  ${
    updateResult.filter( (result) => result.status === UpdateResult.FAILED_TO_FIND_DATAQUERY ||
        result.status === UpdateResult.FAILED_TO_GET_DATA
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
      message: UpdateResult.FAILED_TO_FIND_DATAQUERY
    }
  }

  const data = getData(dataquery)
  if (!data) {
    logDataQueryEvent(dataquery._id, user, {message:Events.FAILED_TO_GET_DATA} )
    return {
      dataquery,
      message: UpdateResult.FAILED_TO_GET_DATA
    }
  }

  const refreshResult = refreshDatasetWithData(JSON.stringify(data), dataquery) // returns a string or updated obejct
  if (typeof(refreshResult) === 'string') {
    logDataQueryEvent(dataquery._id, user, {message:Events.NO_NEW_DATA})
    return {
      dataquery,
      message: refreshResult // can be failed to fetch data or failed to
    }
  } else {
    logDataQueryEvent(dataquery._id, user, {message:Events.COMPLETE})
    return {
      refreshResult,
      message: UpdateResult.COMPLETE
    }
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
