import { Component } from '/lib/xp/portal'
import type { Maths as MathsPartConfig } from '.'
import { render, RenderResponse } from '/lib/enonic/react4xp'

const { getComponent } = __non_webpack_require__('/lib/xp/portal')

const { renderError } = __non_webpack_require__('/lib/ssb/error/error')

exports.get = function (req: XP.Request): XP.Response | RenderResponse {
  try {
    const part: Component<MathsPartConfig> = getComponent()
    return renderPart(req, part)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

exports.preview = (req: XP.Request, part: Component<MathsPartConfig>): RenderResponse => renderPart(req, part)

function renderPart(req: XP.Request, part: Component<MathsPartConfig>): RenderResponse {
  const props: PartProperties = {
    mathsFormula: part.config.mathsFormula,
  }

  return render('site/parts/maths/maths', props, req)
}

interface PartProperties {
  mathsFormula: string
}
