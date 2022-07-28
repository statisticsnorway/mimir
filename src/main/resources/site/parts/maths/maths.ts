import { Component } from '/lib/xp/portal'
import { MathsPartConfig } from '../maths/maths-part-config'
import { React4xp, React4xpResponse } from '../../../lib/types/react4xp'

const {
  getComponent
} = __non_webpack_require__('/lib/xp/portal')
const React4xp: React4xp = __non_webpack_require__('/lib/enonic/react4xp') as React4xp
const {
  renderError
} = __non_webpack_require__('/lib/ssb/error/error')

exports.get = function(req:XP.Request):XP.Response | React4xpResponse {
  try {
    const part:Component<MathsPartConfig> = getComponent()
    return renderPart(req, part)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

exports.preview = (req:XP.Request, part:Component<MathsPartConfig>): React4xpResponse => renderPart(req, part)

function renderPart(req:XP.Request, part:Component<MathsPartConfig>): React4xpResponse {
  const props: PartProperties = {
    mathsFormula: part.config.mathsFormula
  }

  return React4xp.render('site/parts/maths/maths', props, req)
}

interface PartProperties {
  mathsFormula: string;
}
