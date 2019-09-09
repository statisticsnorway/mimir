// import * as http from '/lib/http-client'
// import * as content from '/lib/xp/content'

import * as portal from '/lib/xp/portal'
import * as thymeleaf from '/lib/thymeleaf'

const version = '%%VERSION%%'

exports.get = function(req) {
log.info('-- hello world --')
  const page = portal.getContent()
  const config = {}
  const view = resolve('default.html')
  const model = { version, config, page }
  const body = thymeleaf.render(view, model)
  return { body }
}
