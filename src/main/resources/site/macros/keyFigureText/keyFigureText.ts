import { getContent } from '/lib/xp/portal'
import { get, type Content } from '/lib/xp/content'
import { localize } from '/lib/xp/i18n'
import { React4xp } from '/lib/enonic/react4xp'

import { parseKeyFigure } from '/lib/ssb/parts/keyFigure'
import { renderError } from '/lib/ssb/error/error'
import { getMunicipality } from '/lib/ssb/dataset/klass/municipalities'
import { type RequestWithCode } from '/lib/types/municipalities'
import { DATASET_BRANCH } from '/lib/ssb/repo/dataset'
import { type KeyFigureChanges, type KeyFigureView } from '/lib/types/partTypes/keyFigure'
import { forceArray } from '/lib/ssb/utils/arrayUtils'
import { type KeyFigureTextContext } from '/lib/types/keyFigureText'
import { type KeyFigure } from '/site/content-types'

export function macro(context: XP.MacroContext) {
  try {
    return renderKeyFigureTextMacro(context)
  } catch (e) {
    return renderError(context.request as XP.Request, 'Error in macro', e)
  }
}

const getKeyFigureSourceText = (keyFigure: Content<KeyFigure> | undefined): string | undefined => {
  return forceArray(keyFigure?.data.source).length
    ? forceArray(keyFigure?.data.source).map(({ title }) => title)[0]
    : undefined
}

function renderKeyFigureTextMacro(context: XP.MacroContext) {
  const page = getContent()
  if (!page) throw Error('No page found')

  const keyFigure = context?.params?.keyFigure ? get({ key: context?.params?.keyFigure }) : undefined

  const municipality = getMunicipality({ code: keyFigure?.data.default } as RequestWithCode)
  const language: string = page.language ? page.language : 'nb'
  const keyFigureData = parseKeyFigure(keyFigure as Content<KeyFigure>, municipality, DATASET_BRANCH, language)
  const sourceText = getKeyFigureSourceText(keyFigure as Content<KeyFigure>)

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

function getChangeValue(changes: KeyFigureChanges | undefined): string | undefined {
  let changeValue
  if (changes?.changeText) {
    // When there are no changes, the change period for 'same' is displayed (e.g. "Ingen endring") as the change value. It should be displayed as empty string instead
    if (changes?.changeDirection === 'same') {
      changeValue = ''
    } else {
      changeValue = changes.changeText.replace('-', '') // Remove '-' for negative numbers as it's covered by the change direction
    }
  }
  return changeValue
}

// We have to manually strip away 'endring' for some change periods; sometimes a change period is prefixed with 'endring' e.g. 'endring fra året før'
const getChangePeriod = (changes: KeyFigureChanges | undefined): string | undefined =>
  changes?.changePeriod ? changes.changePeriod.toLowerCase().replace('endring ', '') : undefined

function parseKeyFigureText(
  keyFigureData: KeyFigureView,
  keyFigureTextMacroInput: KeyFigureTextContext | undefined,
  language: string,
  sourceText: string | undefined
) {
  const { title, time, number, numberDescription, changes } = keyFigureData
  const { overwriteIncrease, overwriteDecrease, overwriteNoChange, text } = keyFigureTextMacroInput ?? {}

  const changeDirection = getLocalizedChangeDirection(
    changes?.changeDirection,
    language,
    overwriteIncrease,
    overwriteDecrease,
    overwriteNoChange
  )
  const changeValue = getChangeValue(changes)
  const changePeriod = getChangePeriod(changes)
  const localizedChangePeriod = language !== 'en' && changePeriod ? changePeriod?.toLowerCase() : changePeriod

  return text
    ? text
        .replace(/\$tittel/g, title ?? '<mangler tittel>')
        .replace(/\$tid/g, time ?? '<mangler tid>')
        .replace(/\$tall/g, number ?? '<mangler tall>')
        .replace(/\$benevning/g, numberDescription ?? '<mangler benevning>')
        .replace(/\$endringstekst/g, changeDirection ?? '<mangler endringstekst>')
        .replace(/\$endringstall/g, changeValue ?? '<mangler endringstall>')
        .replace(/\$endringsperiode/g, localizedChangePeriod ?? '<mangler endringsperiode>')
        .replace(/\$kildetekst/g, sourceText ?? '<mangler kildetekst>')
    : [title, time, number, numberDescription, changeDirection, changeValue, localizedChangePeriod, sourceText].join(
        ' '
      )
}
