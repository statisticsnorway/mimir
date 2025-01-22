import { renderError } from '/lib/ssb/error/error'
import { render } from '/lib/enonic/react4xp'

export function get(req: XP.Request): XP.Response {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

export function preview(req: XP.Request) {
  return renderPart(req)
}

function renderPart(req: XP.Request): XP.Response {
  return render('BpiCalculator', {}, req, {
    body: '<section class="xp-part bpi-calculator container"></section>',
  })
}
