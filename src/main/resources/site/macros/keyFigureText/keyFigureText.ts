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
import { forceArray } from '/lib/ssb/utils/arrayUtils'
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
  const sourceText = forceArray(keyFigure?.data.source).length
    ? forceArray(keyFigure?.data.source).map(({ title }) => title)[0]
    : undefined

  const keyFigureText = new React4xp('site/macros/keyFigureText/keyFigureText')
    .setProps({
      text: parseText(keyFigureData, context, sourceText, language),
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
  language: string,
  overwriteIncrease: string | undefined,
  overwriteDecrease: string | undefined,
  overwriteNoChange: string | undefined
) {
  if (changeDirection === 'up') {
    return (
      overwriteIncrease ??
      localize({
        key: 'keyFigureText.increase',
        locale: language,
      })
    )
  }

  if (changeDirection === 'down') {
    return (
      overwriteDecrease ??
      localize({
        key: 'keyFigureText.decrease',
        locale: language,
      })
    )
  }

  if (changeDirection === 'same') {
    return (
      overwriteNoChange ??
      localize({
        key: 'keyFigure.noChange',
        locale: language,
      }).toLowerCase()
    )
  }

  return changeDirection
}

function getChangeText(changes: KeyFigureChanges | undefined): string | undefined {
  let changeText
  if (changes?.changeText) {
    if (changes?.changeDirection === 'same') {
      changeText = ''
    } else {
      changeText = changes.changeText.replace('-', '')
    }
  }
  return changeText
}

// We have to manually strip away 'endring' for change periods to be able to piece these words together in a sentence
const getChangePeriod = (changes: KeyFigureChanges | undefined): string | undefined =>
  changes?.changePeriod ? changes.changePeriod.toLowerCase().replace('endring ', '') : undefined

function handleTextVariables(
  keyFigureData: KeyFigureView,
  changeDirection: string | undefined,
  changePeriod: string | undefined,
  changeText: string | undefined,
  ingress: string,
  language: string,
  sourceText: string | undefined
) {
  const { title, time, number, numberDescription } = keyFigureData
  const localizedChangePeriod = language !== 'en' && changePeriod ? changePeriod?.toLowerCase() : changePeriod

  return ingress
    .replace(/\$tittel/g, title ?? '<mangler tittel>')
    .replace(/\$tid/g, time ?? '<mangler tid>')
    .replace(/\$tall/g, number ?? '<mangler tall>')
    .replace(/\$benevning/g, numberDescription ?? '<mangler benevning>')
    .replace(/\$endringstekst/g, changeDirection ?? '<mangler endringstekst>')
    .replace(/\$endringstall/g, changeText ?? '<mangler endringstall>')
    .replace(/\$endringsperiode/g, localizedChangePeriod ?? '<mangler endringsperiode>')
    .replace(/\$kildetekst/g, sourceText ?? '<mangler kildetekst>')
}

function parseText(
  keyFigureData: KeyFigureView,
  context: XP.MacroContext,
  sourceText: string | undefined,
  language: string
) {
  const { title, time, number, numberDescription, changes } = keyFigureData
  const { text, overwriteIncrease, overwriteDecrease, overwriteNoChange } = context?.params ?? {}

  const changeDirection = getLocalizedChangeDirection(
    changes?.changeDirection,
    language,
    overwriteIncrease,
    overwriteDecrease,
    overwriteNoChange
  )
  const changeText = getChangeText(changes)
  const changePeriod = getChangePeriod(changes)

  const manualText = context?.params?.text
    ? handleTextVariables(keyFigureData, changeDirection, changePeriod, changeText, text, language, sourceText)
    : undefined
  const defaultText = [title, time, number, numberDescription, changeDirection, changeText, changePeriod].join(' ')

  return manualText ?? defaultText
}
