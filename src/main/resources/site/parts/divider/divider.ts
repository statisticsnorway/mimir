import { type Request, type Response } from '@enonic-types/core'
import { getComponent } from '/lib/xp/portal'
import { render } from '/lib/enonic/react4xp'
import { scriptAsset } from '/lib/ssb/utils/utils'

import { renderError } from '/lib/ssb/error/error'
import { fromPartCache } from '/lib/ssb/cache/partCache'
import { type Divider as DividerPartConfig } from '.'

export function get(req: Request): Response {
  try {
    const component = getComponent<XP.PartComponent.Divider>()
    if (!component) throw Error('No component found')

    return renderPart(req, component.config)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

export function preview(req: Request, config = {}): Response {
  return renderPart(req, config)
}

function renderPart(req: Request, config: DividerPartConfig): Response {
  const dividerColor: string = config.dividerColor ?? 'light'

  return fromPartCache(req, `divider${dividerColor}`, () => {
    const result = render('Divider', setColor(dividerColor), req, {
      body: '<section class="xp-part part-divider"></section>',
      hydrate: false,
      pageContributions: {
        bodyEnd: [scriptAsset('js/divider.js')],
      },
    })

    result.body = result.body.replace(/ id=".*?"/i, '')
    return result
  })
}

function setColor(dividerColor: string): object {
  if (dividerColor === 'dark') {
    return {
      dark: true,
    }
  } else {
    return {
      light: true,
    }
  }
}
