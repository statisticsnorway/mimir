const moment = require('/lib/moment-with-locales')

import * as util from '/lib/util'
import * as portal from '/lib/xp/portal'
import * as content from '/lib/xp/content'
import * as thymeleaf from '/lib/thymeleaf'

const view = resolve('./dashboard.html')

exports.get = function(req) {
  const part = portal.getComponent()
  const dashboardIds = part.config.dashboard ? util.data.forceArray(part.config.dashboard) : []
  return renderPart(req, dashboardIds);
}

exports.preview = (req, id) => renderPart(req, [id])

function renderPart(req, dashboardIds) {
  const dashboards = []
  const dataset = {}

  const result = content.query({
    count: 999,
    contentTypes: [`${app.name}:dataset`]
  })

  if (result && result.hits.length > 0) {
    result.hits.forEach((set) => {
      dataset[set.data.dataquery] = set
    })
  }

  const dataQueries = [];
  const dataQueryResult = content.query({
    count: 999,
    contentTypes: [`${app.name}:dataquery`],
    sort: 'displayName'
  })
  if (dataQueryResult && dataQueryResult.hits.length > 0) {
    dataQueryResult.hits.forEach((set) => {
      let updated;
      let updatedHumanReadable;
      const hasData= dataset[set._id] ? true : false
      if (hasData) {
        updated = moment(dataset[set._id].modifiedTime).format('DD.MM.YYYY HH:mm:ss')
        updatedHumanReadable = moment(dataset[set._id].modifiedTime).fromNow()
      }
      dataQueries.push({
        displayName: set.displayName,
        updated,
        updatedHumanReadable,
        class: set.hasData ? 'dataset-ok' : 'dataset-missing'
      });
    })
  }

  dashboardIds.forEach((key) => {
    const item = content.get({ key })
    if (item) {
      dashboards.push({
        displayName: item.displayName
      })
    }
  })

  const dashboardService = portal.serviceUrl({
    service: 'dashboard'
  });
  const model = { dashboards, dataQueries, dashboardService }
  const body = thymeleaf.render(view, model)

  return { body, contentType: 'text/html' }
}
