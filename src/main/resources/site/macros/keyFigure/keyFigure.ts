import { renderError } from '/lib/ssb/error/error'
import { type KeyFigure as KeyFigureConfig } from '/site/macros/keyFigure'

import { preview } from '/site/parts/keyFigure/keyFigure'

export function macro(context: XP.MacroContext<KeyFigureConfig>): XP.Response {
  try {
    const config = context.params
    const keyFigure: XP.Response = preview(context.request, config.keyFigure)

    if (keyFigure.status && keyFigure.status !== 200) throw new Error(`keyFigure with id ${config.keyFigure} missing`)
    keyFigure.body = '<div class = "macro-keyfigure">' + keyFigure.body + '</div>'

    return keyFigure
  } catch (e) {
    return renderError(context.request, 'Error in macro', e)
  }
}
