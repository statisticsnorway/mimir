import { getComponent } from '/lib/xp/portal'
import { render } from '/lib/enonic/react4xp'

import { renderError } from '/lib/ssb/error/error'
import { type MathsProps } from '/lib/types/partTypes/maths'
import { type Maths as MathsPartConfig } from '.'

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
  const props: MathsProps = {
    mathsFormula: config.mathsFormula,
  }

  if (req.mode === 'edit') {
    return render('site/parts/maths/maths', props, req, {
      body: `<div class="part-maths info-text"><span>NB!! Formel vises ikke i edit mode, se i forhåndsvisning</span></div>`,
    })
  }

  return render('site/parts/maths/maths', props, req)
}
