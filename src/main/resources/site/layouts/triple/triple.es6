const portal = __non_webpack_require__( '/lib/xp/portal')
const thymeleaf = __non_webpack_require__( '/lib/thymeleaf')

const view = resolve('triple.html')

exports.get = function(req) {
  const component = portal.getComponent()
  const {
    title,
    hideTitle
  } = component.config

  const model = {
    title,
    hideTitle,
    leftRegion: component.regions.left,
    centerRegion: component.regions.center,
    rightRegion: component.regions.right
  }

  const body = thymeleaf.render(view, model)

  return {
    body
  }
}
