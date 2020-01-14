const portal = __non_webpack_require__( '/lib/xp/portal')
const thymeleaf = __non_webpack_require__( '/lib/thymeleaf')

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
