import { localize } from '/lib/xp/i18n'

import { get, type Content } from '/lib/xp/content'
import { type KeyFigureTextContext, type KeyFigureTextValues } from '/lib/types/keyFigureText'
import { type KeyFigureChanges, type KeyFigureView } from '/lib/types/partTypes/keyFigure'
import { getMunicipality } from '/lib/ssb/dataset/klass/municipalities'
import { forceArray } from '/lib/ssb/utils/arrayUtils'
import { parseKeyFigure } from '/lib/ssb/parts/keyFigure'
import { type RequestWithCode } from '/lib/types/municipalities'
import { DATASET_BRANCH } from '/lib/ssb/repo/dataset'
import { type KeyFigure } from '/site/content-types'

function getLocalizedChangeDirection(
  changeDirection: KeyFigureChanges['changeDirection'] | undefined,
  language: string,
  overwriteIncrease: string | undefined,
  overwriteDecrease: string | undefined,
  overwriteNoChange: string | undefined
) {
  if (!changeDirection) return

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
}

function getChangeValue(changes: KeyFigureChanges | undefined) {
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
const getChangePeriod = (changes: KeyFigureChanges | undefined) =>
  changes?.changePeriod ? changes.changePeriod.toLowerCase().replace('endring ', '') : undefined

function getKeyFigureTextValuesFromString(ingress: string | undefined): KeyFigureTextValues | undefined {
  if (!ingress) return

  const keyFigureId = ingress.match(/keyFigure="([^"]+)"/)
  const { keyFigureData, sourceText, language } = fetchKeyFigureData(keyFigureId ? keyFigureId[1] : undefined)

  const text = ingress.match(/text="([^"]+)"/)
  const overwriteIncrease = ingress.match(/overwriteIncrease="([^"]+)"/)
  const overwriteDecrease = ingress.match(/overwriteDecrease="([^"]+)"/)
  const overwriteNoChange = ingress.match(/overwriteNoChange="([^"]+)"/)

  return {
    keyFigureData,
    sourceText,
    language,
    text: text ? text[1] : undefined,
    overwriteIncrease: overwriteIncrease ? overwriteIncrease[1] : undefined,
    overwriteDecrease: overwriteDecrease ? overwriteDecrease[1] : undefined,
    overwriteNoChange: overwriteNoChange ? overwriteNoChange[1] : undefined,
  }
}

export function fetchKeyFigureData(keyFigureId: string | undefined) {
  const keyFigure = keyFigureId ? get({ key: keyFigureId }) : undefined

  if (!keyFigureId || !keyFigure) {
    log.error(!keyFigureId ? `Key Figure with id "${keyFigureId}" not found` : 'Missing keyFigureId')
    return { keyFigureData: undefined, sourceText: undefined, language: undefined }
  }

  const municipality = getMunicipality({ code: keyFigure?.data.default } as RequestWithCode)
  const language: string = keyFigure?.language ? keyFigure.language : 'nb'
  const keyFigureData = parseKeyFigure(keyFigure as Content<KeyFigure>, municipality, DATASET_BRANCH, language)
  const sourceText = forceArray(keyFigure?.data.source).length
    ? forceArray(keyFigure?.data.source).map(({ title }) => title)[0]
    : undefined

  return { keyFigureData, sourceText, language }
}

export function getIngressWithKeyFigureText(ingress: string | undefined) {
  if (!ingress) return

  const keyFigureTextMacroMatches = ingress.match(/\[keyFigureText\b[^]*?\/\]/g)
  if (!keyFigureTextMacroMatches?.length) return ingress

  let ingressWithKeyFigureText = ingress
  keyFigureTextMacroMatches.forEach((keyFigureTextMacro) => {
    const keyFigureTextValues = getKeyFigureTextValuesFromString(keyFigureTextMacro)

    if (keyFigureTextValues) {
      const { keyFigureData, text, overwriteIncrease, overwriteDecrease, overwriteNoChange, language, sourceText } =
        keyFigureTextValues

      if (!keyFigureData) {
        log.error('Cannot parse Key Figure Text macro, missing or invalid keyFigureId')
        ingressWithKeyFigureText = ingressWithKeyFigureText.replace(keyFigureTextMacro, '')
      }

      const keyFigureText = parseKeyFigureText(
        keyFigureData as KeyFigureView,
        { text, overwriteIncrease, overwriteDecrease, overwriteNoChange } as KeyFigureTextContext,
        language as string,
        sourceText
      )

      ingressWithKeyFigureText = ingressWithKeyFigureText.replace(keyFigureTextMacro, keyFigureText)
    }
  })
  return ingressWithKeyFigureText
}

export function parseKeyFigureText(
  keyFigureData: KeyFigureView,
  keyFigureTextMacroInput: KeyFigureTextContext | undefined,
  language = 'nb',
  sourceText: string | undefined
) {
  const { title, time, number, numberDescription, changes } = keyFigureData ?? {}
  const { overwriteIncrease, overwriteDecrease, overwriteNoChange, text } = keyFigureTextMacroInput ?? {}

  const localizedTime = language !== 'en' && time ? time?.toLowerCase() : time
  const changeDirection = getLocalizedChangeDirection(
    changes?.changeDirection,
    language,
    overwriteIncrease,
    overwriteDecrease,
    overwriteNoChange
  )
  const changeValue = getChangeValue(changes)
  const changePeriod = getChangePeriod(changes)

  return text
    ? text
        .replace(/\$tittel/g, title ?? '<mangler tittel>')
        .replace(/\$tid/g, localizedTime ?? '<mangler tid>')
        .replace(/\$tall/g, number ?? '<mangler tall>')
        .replace(/\$benevning/g, numberDescription ?? '<mangler benevning>')
        .replace(/\$endringstekst/g, changeDirection ?? '<mangler endringstekst>')
        .replace(/\$endringstall/g, changeValue ?? '<mangler endringstall>')
        .replace(/\$endringsperiode/g, changePeriod ?? '<mangler endringsperiode>')
        .replace(/\$kildetekst/g, sourceText ?? '<mangler kildetekst>')
    : [title, localizedTime, number, numberDescription, changeDirection, changeValue, changePeriod, sourceText].join(
        ' '
      )
}
