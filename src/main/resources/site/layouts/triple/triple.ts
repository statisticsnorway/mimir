import { getComponent } from '/lib/xp/portal'
import { render } from '/lib/thymeleaf'

const view = resolve('triple.html')

export function get() {
  const component = getComponent<XP.LayoutComponent.Triple>()!
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
