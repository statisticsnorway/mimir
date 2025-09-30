import { getComponent } from '/lib/xp/portal'
import { Content, get as getContent } from '/lib/xp/content'
import { render } from '/lib/enonic/react4xp'
import { renderError } from '/lib/ssb/error/error'
import { type MathsProps } from '/lib/types/partTypes/maths'
import { Maths } from '/site/content-types/maths'

export function get(req: XP.Request): XP.Response {
  try {
    const part = getComponent<XP.PartComponent.Maths>()
    if (!part) throw Error('No part found')

    const config: string = part.config.contentId

    return renderPart(req, config)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

export function preview(req: XP.Request, config: string) {
  return renderPart(req, config)
}

function renderPart(req: XP.Request, config: string) {
  if (!config) {
    return render('site/parts/maths/maths', {}, req, {
      body: `<div class="info-text"><span>Feil, mangler config!</span></div>`,
    })
  }

  const content: Content<Maths> | null = getContent({
    key: config,
  })

  if (!content) {
    return render('site/parts/maths/maths', {}, req, {
      body: `<div class="info-text"><span>Feil, mangler content!</span></div>`,
    })
  }

  const props: MathsProps = {
    mathsFormula: content.data.mathsFormula,
  }

  if (req.mode === 'edit') {
    return render('site/parts/maths/maths', props, req, {
      body: `<div class="info-text"><span>NB! Formelen vises i LaTeX-format i redigeringsmodus. Forhåndsvisning viser formel riktig.</span></div>`,
    })
  }
  return render('site/parts/maths/maths', {}, req, {
    body: `<div class="info-text"><span>Feil, mangler content!</span></div>`,
  })
  // return render('site/parts/maths/maths', props, req)
}
