import { getComponent, Component } from '/lib/xp/portal'
import { ResourceKey, render } from '/lib/thymeleaf'
import { React4xp, React4xpObject } from '../../../lib/types/react4xp'
import { DividerPartConfig } from './divider-part-config'

const {
  renderError
} = __non_webpack_require__('/lib/ssb/error/error')
const {
  fromPartCache
} = __non_webpack_require__('/lib/ssb/cache/partCache')


const view: ResourceKey = resolve('./divider.html')

exports.get = function(req: XP.Request): XP.Response {
  try {
    const component: Component<DividerPartConfig> = getComponent()
    return renderPart(req, component.config)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

exports.preview = function(req: XP.Request): XP.Response {
  return renderPart(req, {})
}

function renderPart(req: XP.Request, config: DividerPartConfig): XP.Response {
  const dividerColor: string = config.dividerColor || 'light'

  return fromPartCache(req, `divider${dividerColor}`, () => {
    const divider: React4xpObject = new React4xp('Divider')
      .setProps(
        setColor(dividerColor)
      )
      .setId('dividerId')

    const body: string = divider.renderBody({
      body: render(view, {
        dividerId: divider.react4xpId
      }),
      clientRender: false
    }).replace(/id="dividerId"/, '') // remove id since we don't need it, and don't want warnings from multiple elements with same id

    return {
      body
    }
  })
}

function setColor(dividerColor: string): object {
  if (dividerColor === 'dark') {
    return {
      dark: true
    }
  } else {
    return {
      light: true
    }
  }
}

