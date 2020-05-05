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
  getDataSetWithDataQueryId,
  getUpdated,
  getUpdatedReadable
} = __non_webpack_require__( '/lib/ssb/dataset')
const {
  createJobNode, completeJob
} = __non_webpack_require__('/lib/repo/job')
const {startQuery, setQueryLogStatus, UpdateResult} = __non_webpack_require__('/lib/repo/query')
const i18n = __non_webpack_require__('/lib/xp/i18n')

exports.get = function(req) {
  const params = req.params

  let updateResult
  let jobLog
  if (params && params.id) {
    updateResult = context.run(createContextOption('master'), () => {
      const dataqueries = getAllOrOneDataQuery(params.id)
      const allDataQueryIds = dataqueries.map( (dataquery) => dataquery._id)
      jobLog = createJobNode(allDataQueryIds)
      return dataqueries.map((dataquery) => {
        const ts = new Date()
        const updatedQueryNode = updateDataQuery(dataquery, jobLog, ts)
        return {
          id: dataquery._id,
          ...updatedQueryNode.data,
          lastUpdated: ts.toISOString(),
          updateMessage: i18n.localize({key:updatedQueryNode.data.lastUpdateResult}),
          updatedHumanReadable: getUpdatedReadable(ts.toISOString())
        }
      })
    })
  } else {
    updateResult = [{
      success: false,
      message: `Missing parameter "id"`,
      status: 400
    }]
  }

  const messageObject = createFeedback(updateResult)
  if(jobLog) completeJob(jobLog._id, messageObject.success, messageObject.message, messageObject.status)

  const returnObj = {
    body: {
      updates: updateResult,
      message: messageObject.message,
      status: messageObject.status,
      success: messageObject.success
    },
    contentType: 'application/json',
    status: messageObject.status
  }
  log.info('%s', JSON.stringify(returnObj, null, 2))
  return returnObj
}

function createFeedback(updateResult) {
  if(updateResult.length === 1){
    return {
      message: i18n.localize({key: updateResult[0].lastUpdateResult}),
      status: 200
    }
  }
  return {
    message: `Successfully Updated/created: ${
      updateResult.filter( (result) => result.lastUpdateResult === UpdateResult.COMPLETE).length
    } No new data : ${
      updateResult.filter( (result) => result.lastUpdateResult === UpdateResult.NO_NEW_DATA).length
    } Failed:  ${
      updateResult.filter( (result) => result.lastUpdateResult === UpdateResult.FAILED_TO_FIND_DATAQUERY ||
        result.lastUpdateResult === UpdateResult.FAILED_TO_GET_DATA
      ).length
    } Total: ${
      updateResult.length
    }`,
    success: true,
    status: 200
  }
}

function updateDataQuery(dataquery, jobLog, ts) {
  const queryLog = startQuery(dataquery, jobLog, ts)
  if (!dataquery) return setQueryLogStatus(queryLog._id, UpdateResult.FAILED_TO_FIND_DATAQUERY)

  const data = getData(dataquery, jobLog._id)
  if (!data) return setQueryLogStatus(queryLog._id, UpdateResult.FAILED_TO_GET_DATA)

  const dataset = refreshDatasetWithData(JSON.stringify(data), dataquery)
  if (dataset) {
    return setQueryLogStatus(queryLog._id, UpdateResult.COMPLETE)
  } else {
    return setQueryLogStatus(queryLog._id, UpdateResult.NO_NEW_DATA)
  }
}


exports.delete = (req) => {
  let status = 200
  let message = ''
  let success = true
  const datasetInfo = []
  const params = req.params

  if (params && params.id) {
    context.run(createContextOption('draft'), () => {
      let datasets = []
      if (params.id === '*') { // delete all
        datasets = content.query({
          start: 0,
          count: 999,
          contentTypes: [`${app.name}:dataset`]
        }).hits
      } else { // delete one
        datasets = getDataSetWithDataQueryId(params.id).hits
      }
      if (datasets.length > 0) {
        const datasetsToPublish = []
        datasets.forEach((dataset) => {
          const isDeleted = content.delete({
            key: dataset._id
          })
          if (isDeleted) {
            datasetInfo.push({
              id: dataset.data.dataquery,
              updated: '',
              updatedHumanReadable: '',
              hasData: false
            })
            datasetsToPublish.push(dataset._id)
          }
        })
        content.publish({
          keys: datasetsToPublish,
          sourceBranch: 'draft',
          targetBranch: 'master'
        })
        message = `Successfully deleted ${datasetInfo.length} of ${datasets.length} datasets`
      } else {
        success = false
        message = `No dataset found for dataquery with id ${params.id}`
        status = 404
      }
    })
  } else {
    success = false
    message = `Missing parameter "id"`
    status = 400
  }

  return {
    body: {
      success,
      message,
      updates: datasetInfo
    },
    contentType: 'application/json',
    status
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
