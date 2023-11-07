// @ts-ignore
import { getComponent } from '/lib/xp/portal'
import { render as r4XpRender } from '/lib/enonic/react4xp'
import { renderError } from '/lib/ssb/error/error'

export function get(req: XP.Request): XP.Response {
  try {
    const part = getComponent<XP.PartComponent.Highchart>()
    if (!part) throw Error('No part found')

    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

export function preview(req: XP.Request): XP.Response {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

function renderPart(req: XP.Request): XP.Response {
  const component = getComponent<XP.PartComponent.HighchartRaw>()
  if (!component) throw Error('No part found')

  // R4xp disables hydration in edit mode, but highcharts need hydration to show
  // we sneaky swap mode since we want a render of higchart in edit mode
  const _req = req
  if (req.mode === 'edit') _req.mode = 'preview'

  return r4XpRender('site/parts/highchartRaw/HighchartRaw', { config: component.config.config }, _req, {
    body: '<section class="xp-part part-highchart-raw"></section>',
  })
}
