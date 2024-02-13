import { getComponent } from '/lib/xp/portal'
import { render } from '/lib/thymeleaf'
import { pageMode } from '/lib/ssb/utils/utils'

const view = resolve('topic.html')

export function get(req: XP.Request) {
  const component = getComponent<XP.LayoutComponent.Topic>()!
  const mode = pageMode(req)
  const { title, hideTitle } = component.config
  const model = {
    title,
    hideTitle,
    mainRegion: component.regions.main,
    mode,
  }
  const body = render(view, model)
  return {
    body,
  }
}
