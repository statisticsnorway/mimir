import * as portal from '/lib/xp/portal'
import * as thymeleaf from '/lib/thymeleaf'
import { pageMode } from '/lib/ssb/utils'

exports.get = function(req) {
  const page = portal.getContent()
  const component = portal.getComponent()
  const view = resolve('topic.html')
  const mode = pageMode(req, page)
  const model = { config: component.config, mainRegion: component.regions.main, mode }
  const body = thymeleaf.render(view, model)
  return { body }
}
