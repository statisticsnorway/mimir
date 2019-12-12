const portal = __non_webpack_require__( '/lib/xp/portal')
const thymeleaf = __non_webpack_require__( '/lib/thymeleaf')
const municipals = __non_webpack_require__( '/lib/municipals')

exports.get = function(req) {
  const page = portal.getContent()
  const component = portal.getComponent()
  const view = resolve('topic.html')
  const mode = municipals.mode(req, page)
  const model = { config: component.config, mainRegion: component.regions.main, mode }
  const body = thymeleaf.render(view, model)
  return { body }
}
