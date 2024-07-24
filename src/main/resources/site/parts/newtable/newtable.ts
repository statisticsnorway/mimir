import { getComponent } from '/lib/xp/portal'
import { render as r4xpRender } from '/lib/enonic/react4xp'
import { renderError } from '/lib/ssb/error/error'

export function get(req: XP.Request): XP.Response {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part: ', e)
  }
}

export function renderPart(req: XP.Request): XP.Response {
  const part = getComponent<XP.PartComponent.NewTable>()
  if (!part) throw Error('No part found')
  const props = {}
  return r4xpRender('site/parts/newtable/newtable', props, req)
}
