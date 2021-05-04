const portal = __non_webpack_require__( '/lib/xp/portal')
const thymeleaf = __non_webpack_require__( '/lib/thymeleaf')
const {
  pageMode
} = __non_webpack_require__( '/lib/ssb/utils/utils')

const view = resolve('topic.html')

exports.get = function(req) {
  const page = portal.getContent()
  const component = portal.getComponent()
  const mode = pageMode(req, page)
  const {
    title,
    hideTitle
  } = component.config
  const model = {
    title,
    hideTitle,
    mainRegion: component.regions.main,
    mode
  }
  const body = thymeleaf.render(view, model)
  return {
    body
  }
}
