// import * as http from '/lib/http-client'
// import * as content from '/lib/xp/content'

import * as portal from '/lib/xp/portal'
import * as thymeleaf from '/lib/thymeleaf'

const version = '%%VERSION%%'

exports.get = function(req) {
log.info('-- hello world --')
  const page = portal.getContent()
  const isFragment = page.type === 'portal:fragment'
  const mainRegion = isFragment ? null : page.page && page.page.regions && page.page.regions.main
  const config = {}
  const view = resolve('default.html')
  const model = { version, config, page, mainRegion }
  const body = thymeleaf.render(view, model)
  return { body }
}
