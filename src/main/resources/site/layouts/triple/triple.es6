import { render } from '/lib/thymeleaf'

const portal = __non_webpack_require__('/lib/xp/portal')
const view = resolve('triple.html')

exports.get = function () {
  const component = portal.getComponent()
  const { title, hideTitle } = component.config

  const model = {
    title,
    hideTitle,
    leftRegion: component.regions?.left || { components: [] },
    centerRegion: component.regions?.center || { components: [] },
    rightRegion: component.regions?.right || { components: [] },
  }

  const body = render(view, model)

  return {
    body,
  }
}
