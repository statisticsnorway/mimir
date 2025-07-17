import { getContent } from '/lib/xp/portal'
import { get, type Content } from '/lib/xp/content'
import { localize } from '/lib/xp/i18n'
import { React4xp } from '/lib/enonic/react4xp'

import { parseKeyFigure } from '/lib/ssb/parts/keyFigure'
import { renderError } from '/lib/ssb/error/error'
import { getMunicipality } from '/lib/ssb/dataset/klass/municipalities'
import { RequestWithCode } from '/lib/types/municipalities'
import { DATASET_BRANCH } from '/lib/ssb/repo/dataset'
import { type KeyFigureChanges, type KeyFigureView } from '/lib/types/partTypes/keyFigure'
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

  const keyFigureText = new React4xp('site/macros/keyFigureText/keyFigureText')
    .setProps({
      text: parseText(keyFigureData, context, language),
    })
    .uniqueId()

  return {
    body: keyFigureText.renderBody({
      body: `<span id="${keyFigureText.react4xpId}"></span>`,
      request: context.request,
    }),
  }
}

function getLocalizedChangeDirection(
  changeDirection: KeyFigureChanges['changeDirection'] | undefined,
  language: string
) {
  if (changeDirection === 'up') {
    return localize({
      key: 'keyFigure.increase',
      locale: language,
    }).toLowerCase()
  }

  if (changeDirection === 'down') {
    return localize({
      key: 'keyFigure.decrease',
      locale: language,
    }).toLowerCase()
  }

  if (changeDirection === 'same') {
    return localize({
      key: 'keyFigure.noChange',
      locale: language,
    }).toLowerCase()
  }

  return changeDirection
}

function parseText(keyFigureData: KeyFigureView, context: XP.MacroContext, language: string) {
  const { title, time, number, numberDescription, changes } = keyFigureData

  const changeDirection = changes?.changeDirection
    ? getLocalizedChangeDirection(changes.changeDirection, language)
    : undefined
  const changeText = changes?.changeText
  // We have to manually strip away 'endring' for change periods that have that word
  const changePeriod = changes?.changePeriod ? changes.changePeriod.toLowerCase().replace('endring ', '') : undefined

  // These should be resolved in Content Studio so we might not need to translate these
  const manualText = context?.params?.text
    ? context.params.text
        .replace(/\[tittel\]/g, title ?? '<mangler tittel>')
        .replace(/\[tid\]/g, time ?? '<mangler tid>')
        .replace(/\[tall\]/g, number ?? '<mangler tall>')
        .replace(/\[benevning\]/g, numberDescription ?? '<mangler benevning>')
        .replace(/\[endringstekst\]/g, changeDirection ?? '<mangler endringstekst>')
        .replace(/\[endringstall\]/g, changeText ?? '<mangler endringstall>')
        .replace(/\[endringsperiode\]/g, changePeriod ?? '<mangler endringsperiod>')
    : undefined
  const defaultText = [title, time, number, numberDescription, changeDirection, changeText, changePeriod].join(' ')

  return manualText ?? defaultText
}
