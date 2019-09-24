import * as portal from '/lib/xp/portal'
import * as thymeleaf from '/lib/thymeleaf'

exports.get = function(req) {
  const component = portal.getComponent()
  const size = component.config.size
  const view = resolve('columns.html')

  let leftSize = 'col-md-6'
  let rightSize = 'col-md-6'

  if (size == 'a') {
    leftSize = 'col-md-5'
    rightSize = 'col-md-7'
  }

  const model = {
    leftRegion: component.regions.left,
    rightRegion: component.regions.right,
    leftSize,
    rightSize
  }

  const body = thymeleaf.render(view, model)

  return { body }
}
