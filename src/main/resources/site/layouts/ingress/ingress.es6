import * as portal from '/lib/xp/portal'
import * as thymeleaf from '/lib/thymeleaf'

exports.get = function(req) {
  const component = portal.getComponent()
  const view = resolve('ingress.html')

  const model = { config: component.config, mainRegion: component.regions.main }
  const body = thymeleaf.render(view, model)

  return { body }
}
