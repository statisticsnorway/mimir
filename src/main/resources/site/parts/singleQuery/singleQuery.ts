import { getComponent } from '/lib/xp/portal'
// import { type Phrases } from '/lib/types/language'
// import * as util from '/lib/util'
// import { getPhrases } from '/lib/ssb/utils/language'
import { renderError } from '/lib/ssb/error/error'
import { render } from '/lib/enonic/react4xp'

// import { type SingleQuery as SingleQueryPartConfig } from '.'

export function get(req: XP.Request) {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part ', e)
  }
}

export function preview(req: XP.Request) {
  return renderPart(req)
}

function renderPart(req: XP.Request): XP.Response {
  const part = getComponent<XP.PartComponent.SingleQuery>()
  if (!part) throw Error('No part found')

  const props = {
    icon: part.config.icon,
    ingress: part.config.ingress,
    placeholder: part.config.placeholder ?? '',
    code: part.config.code,
    altText: 'family icon', // TODO legge til felt for alt tekst??
    table: part.config.table,
    query: part.config.json,
    resultLayout: part.config.body,
  }

  return render('SingleQuery', props, req, {
    body: '<section class="xp-part"></section>',
  })
}
