import { getContent } from '/lib/xp/portal'
import { React4xp } from '/lib/enonic/react4xp'

import { renderError } from '/lib/ssb/error/error'
import { fetchKeyFigureData, parseKeyFigureText } from '/lib/ssb/utils/keyFigureTextUtils'

export function macro(context: XP.MacroContext) {
  try {
    return renderKeyFigureTextMacro(context)
  } catch (e) {
    return renderError(context.request as XP.Request, 'Error in macro', e)
  }
}

function renderKeyFigureTextMacro(context: XP.MacroContext) {
  const page = getContent()
  if (!page) throw Error('No page found')

  const { keyFigureData, language, sourceText } = fetchKeyFigureData(context?.params?.keyFigure)
  const keyFigureText = new React4xp('site/macros/keyFigureText/keyFigureText')
    .setProps({
      text: parseKeyFigureText(keyFigureData, context.params, language, sourceText),
    })
    .uniqueId()

  return {
    body: keyFigureText.renderBody({
      body: `<span id="${keyFigureText.react4xpId}"></span>`,
      request: context.request,
    }),
  }
}
