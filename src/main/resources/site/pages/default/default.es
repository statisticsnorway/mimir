// import * as http from '/lib/http-client'
// import * as portal from '/lib/xp/portal'
// import * as content from '/lib/xp/content'

import * as thymeleaf from '/lib/xp/thymeleaf'

const version = '%%VERSION%%'

exports.get = function(req) {
  const config = {}
  const view = resolve('default.html')
  const model = { version, config }
  const body = thymeleaf.render(view, model)
  return { body }
}
