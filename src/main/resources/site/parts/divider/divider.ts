import { getComponent, Component } from '/lib/xp/portal'
import { render } from '/lib/enonic/react4xp'
import { DividerPartConfig } from './divider-part-config'

const {
  renderError
} = __non_webpack_require__('/lib/ssb/error/error')
const {
  fromPartCache
} = __non_webpack_require__('/lib/ssb/cache/partCache')

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
    return render(
      'Divider',
      setColor(dividerColor),
      req,
      {
        body: '<section class="xp-part part-divider"></section>'
      }
    )
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

