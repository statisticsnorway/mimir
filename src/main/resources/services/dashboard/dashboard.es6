import { job } from '/main'
import * as auth from '/lib/xp/auth'
import * as context from '/lib/xp/context'
import * as content from '/lib/xp/content'

function temporary(draft, master) {
log.info('-- running temporary --');
  // Temporary code to remove old content type statistikkbanken
  context.run(draft, () => {
    const dataquery = content.query({ count: 999, contentTypes: [`${app.name}:dataquery`] })
    const statistikkbanken = content.query({ count: 999, contentTypes: [`${app.name}:statistikkbanken`] })
    if (dataquery && dataquery.total === 0 && statistikkbanken && statistikkbanken.total) {
      statistikkbanken.hits.map((data) => {
log.info(JSON.stringify(data, null, ' '))
        const create = content.create({ name: data.name, parentPath: '/mimir/temporary', displayName: data.displayName, contentType: `${app.name}:dataquery`, data: {
          table: data.data.table,
          json: data.data.json,
          regiontype: data.data.regiontype
        }})
        if (create) {
          const keyFigure = content.query({ count: 999, contentTypes: [`${app.name}:key-figure`], query: `data.query = '${data._id}'` })
log.info(JSON.stringify(data, null, ' '))
          if (keyFigure && keyFigure.total) {
            const modify = keyFigure.hits.map((figure) => {
              content.modify({ key: figure._id, editor: (r) => {
                r.data.dataquery = create._id
                return r
              }})
            })
          }
        }
      })
    }
  })
}

exports.get = function(req) {
  const _user = auth.getUser()
  const user = { login: _user.login, userStore: _user.idProvider }
  const draft = { repository: 'com.enonic.cms.default', branch: 'draft', principals: ['role:system.admin'], user } // Draft context (XP)
  const master = { repository: 'com.enonic.cms.default', branch: 'master', principals: ['role:system.admin'], user } // Master context (XP)
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
  else {
    temporary(draft, master)
    // return { body: { success: true }, contentType: 'application/json', status: 200 }
  }
  context.run(master, () => job())
  return { body: { success: true }, contentType: 'application/json', status: 200 }
}
