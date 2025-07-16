import { getContent } from '/lib/xp/portal'
import { get, type Content } from '/lib/xp/content'
import { React4xp } from '/lib/enonic/react4xp'

import { parseKeyFigure } from '/lib/ssb/parts/keyFigure'
import { renderError } from '/lib/ssb/error/error'
import { getMunicipality } from '/lib/ssb/dataset/klass/municipalities'
import { RequestWithCode } from '/lib/types/municipalities'
import { DATASET_BRANCH } from '/lib/ssb/repo/dataset'
import { KeyFigure } from '/site/content-types'

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

  const keyFigure = context?.params?.keyFigure ? get({ key: context?.params?.keyFigure }) : undefined

  const municipality = getMunicipality({ code: keyFigure?.data.default } as RequestWithCode)
  const language: string = page.language ? page.language : 'nb'
  const keyFigureData = parseKeyFigure(keyFigure as Content<KeyFigure>, municipality, DATASET_BRANCH, language)

  const { title, time, number, numberDescription, changes } = keyFigureData
  const changeText = changes?.srChangeText

  // These should be resolved in Content Studio so we might not need to translate these
  const manualText = context?.params?.text
    ? context.params.text
        .replace(/\[tittel\]/g, title ?? 'Mangler tittel.')
        .replace(/\[tid\]/g, time ?? 'Mangler tid.')
        .replace(/\[tall\]/g, number ?? 'Mangler tall.')
        .replace(/\[benevning\]/g, numberDescription ?? 'Mangler benevning.')
        .replace(/\[endringstekst\]/g, changeText ?? 'Mangler endringstekst.')
    : undefined
  const defaultText = [title, time, number, numberDescription, changeText].join(' ')

  const keyFigureText = new React4xp('site/macros/keyFigureText/keyFigureText')
    .setProps({
      text: manualText ?? defaultText,
    })
    .uniqueId()

  return {
    body: keyFigureText.renderBody({
      body: `<span id="${keyFigureText.react4xpId}"></span>`,
      request: context.request,
    }),
  }
}
