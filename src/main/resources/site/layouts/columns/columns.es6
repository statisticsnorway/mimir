const portal = __non_webpack_require__( '/lib/xp/portal')
const thymeleaf = __non_webpack_require__( '/lib/thymeleaf')

exports.get = function (req) {
  const component = portal.getComponent()
  const size = component.config.size
  const view = resolve('columns.html')

  // Default 50/50
  let leftSize = 'col-md-6'
  let rightSize = 'col-md-6'

  if (size === 'a') {
    leftSize = 'col-md-4'
    rightSize = 'col-md-8'
  } else if (size === 'c') {
    leftSize = 'col-md-8'
    rightSize = 'col-md-4'
  }

  const model = {
    size,
    leftRegion: component.regions.left,
    rightRegion: component.regions.right,
    leftSize,
    rightSize
  }

  const body = thymeleaf.render(view, model)

  return { body }
}
