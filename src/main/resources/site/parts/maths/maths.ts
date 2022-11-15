import type {Component} from '/lib/xp/portal'
import type {MathsPartConfig} from './maths-part-config'
import {render, type RenderResponse} from '/lib/enonic/react4xp'
import {getComponent} from '/lib/xp/portal'

const {
  renderError
} = __non_webpack_require__('/lib/ssb/error/error')

export function get(req: XP.Request): XP.Response | RenderResponse {
  try {
    const part: Component<MathsPartConfig> = getComponent()
    return renderPart(req, part)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

export function preview(req: XP.Request, part: Component<MathsPartConfig>): RenderResponse {
  return renderPart(req, part)
}

function renderPart(req: XP.Request, part: Component<MathsPartConfig>): RenderResponse {
  const props: PartProperties = {
    mathsFormula: part.config.mathsFormula
  }

  return render('site/parts/maths/maths', props, req)
}

interface PartProperties {
  mathsFormula: string;
}
