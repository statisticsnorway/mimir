import type { Maths as MathsPartConfig } from '.'
import { render } from '/lib/enonic/react4xp'
import { getComponent } from '/lib/xp/portal'

const { renderError } = __non_webpack_require__('/lib/ssb/error/error')

export function get(req: XP.Request): XP.Response {
  try {
    const part = getComponent<XP.PartComponent.Maths>()
    if (!part) throw Error('No part found')

    const config: MathsPartConfig = part.config

    return renderPart(req, config)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

export function preview(req: XP.Request, config: MathsPartConfig) {
  return renderPart(req, config)
}

function renderPart(req: XP.Request, config: MathsPartConfig) {
  const props: PartProperties = {
    mathsFormula: config.mathsFormula,
  }

  return render('site/parts/maths/maths', props, req)
}

interface PartProperties {
  mathsFormula: string
}
