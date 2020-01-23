const auth = __non_webpack_require__( '/lib/xp/auth')
const context = __non_webpack_require__( '/lib/xp/context')
const content = __non_webpack_require__( '/lib/xp/content')
const {
  refreshDataset
} = __non_webpack_require__('/lib/dataquery')
const {
  getDataSetWithDataQueryId,
  getUpdated,
  getUpdatedReadable
} = __non_webpack_require__( '/lib/ssb/dataset')

exports.get = function(req) {
  let status = 200
  let message = ''
  let success = true
  const datasetInfo = []
  const params = req.params

  if (params && params.id) {
    if (params.id === '*') { // update/create all
      context.run(createContextOption('master'), () => {
        const dataqueries = content.query({
          count: 999,
          contentTypes: [`${app.name}:dataquery`],
          query: `data.table LIKE 'http*'`
        }).hits
        dataqueries.map((dataquery) => {
          const dataset = refreshDataset(dataquery)
          if (dataset) {
            datasetInfo.push({
              id: dataset.data.dataquery,
              lastUpdated: getUpdated(dataset),
              lastUpdatedReadable: getUpdatedReadable(dataset),
              hasData: true
            })
          }
        })
        message = `Successfully updated/created ${datasetInfo.length} of ${dataqueries.length} datasets`
      })
    } else { // update/create one
      context.run(createContextOption('master'), () => {
        const dataquery = content.get({
          key: req.params.id
        })
        if (dataquery) {
          const dataset = refreshDataset(dataquery)
          if (dataset) {
            message = `Successfully updated/created dataset for dataquery`
            datasetInfo.push({
              id: dataset.data.dataquery,
              lastUpdated: getUpdated(dataset),
              lastUpdatedReadable: getUpdatedReadable(dataset),
              hasData: true
            })
          } else {
            message = `Failed to get data for dataquery: ${dataquery._id}`
            status = 500
          }
        } else {
          success = false
          message = `No dataquery found with id: ${req.params.id}`
          status = 404
        }
      })
    }
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
              lastUpdated: '',
              lastUpdatedReadable: '',
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
