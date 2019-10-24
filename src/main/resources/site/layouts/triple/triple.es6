import * as portal from '/lib/xp/portal'
import * as thymeleaf from '/lib/thymeleaf'

exports.get = function(req) {
  const component = portal.getComponent()
  const view = resolve('triple.html')

  const model = {
    leftRegion: component.regions.left,
    centerRegion: component.regions.center,
    rightRegion: component.regions.right
  }

  const body = thymeleaf.render(view, model)

  return { body }
}
