import { statistikkbanken }  from '/main'
import * as context from '/lib/xp/context'
import * as content from '/lib/xp/content'

const user = { login: 'su', userStore: 'system' }
const draft = { repository: 'com.enonic.cms.default', branch: 'draft', principals: ['role:system.admin'], user } // Draft context (XP)
const master = { repository: 'com.enonic.cms.default', branch: 'master', principals: ['role:system.admin'], user } // Master context (XP)

exports.get = function(req) {
  if (req.params.delete) {
    context.run(master, () => {
      const datasets = content.query({ count: 999, contentTypes: [`${app.name}:dataset`] })
      datasets && datasets.hits.map((dataset) => content.delete({ key: dataset._id }))
    })
    context.run(draft, () => {
      const datasets = content.query({ count: 999, contentTypes: [`${app.name}:dataset`] })
      datasets && datasets.hits.map((dataset) => content.delete({ key: dataset._id }))
    })
    return { body: { success: true }, contentType: 'application/json', status: 200 }
  }
  context.run(master, () => {
    statistikkbanken()
  })
  return { body: { success: true }, contentType: 'application/json', status: 200 }
}
