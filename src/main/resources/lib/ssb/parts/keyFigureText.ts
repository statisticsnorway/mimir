import { localize } from '/lib/xp/i18n'

import { get, type Content } from '/lib/xp/content'
import { type KeyFigureTextContext, type KeyFigureTextValues } from '/lib/types/keyFigureText'
import { type KeyFigureChanges, type KeyFigureView } from '/lib/types/partTypes/keyFigure'
import { getMunicipality } from '/lib/ssb/dataset/klass/municipalities'
import { forceArray } from '/lib/ssb/utils/arrayUtils'
import { parseKeyFigure } from '/lib/ssb/parts/keyFigure'
import { type RequestWithCode } from '/lib/types/municipalities'
import { type KeyFigure } from '/site/content-types'

function getKeyFigureTextValuesFromString(ingress: string | undefined): KeyFigureTextValues | undefined {
  if (ingress) {
    const keyFigureId = ingress.match(/keyFigure="([^"]+)"/)
    const keyFigure = keyFigureId ? get({ key: keyFigureId[1] }) : undefined

    const municipality = getMunicipality({ code: keyFigure?.data.default } as RequestWithCode)
    const language = keyFigure?.language ? keyFigure.language : 'nb'
    const keyFigureData = parseKeyFigure(keyFigure as Content<KeyFigure>, municipality, 'master', language)
    const sourceText = getKeyFigureSourceText(keyFigure as Content<KeyFigure>)

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
}

export function getIngressWithKeyFigureText(ingress: string | undefined) {
  const keyFigureTextValues = getKeyFigureTextValuesFromString(ingress)

  if (keyFigureTextValues) {
    const { keyFigureData, text, overwriteIncrease, overwriteDecrease, overwriteNoChange, language, sourceText } =
      keyFigureTextValues

    const ingressWithKeyFigureText = parseKeyFigureText(
      keyFigureData as KeyFigureView,
      { text, overwriteIncrease, overwriteDecrease, overwriteNoChange } as KeyFigureTextContext,
      language as string,
      sourceText
    )
    return ingress?.replace(/\[keyFigureText\b[^]*?\/\]/g, ingressWithKeyFigureText)
  }
}

export const getKeyFigureSourceText = (keyFigure: Content<KeyFigure> | undefined): string | undefined => {
  return forceArray(keyFigure?.data.source).length
    ? forceArray(keyFigure?.data.source).map(({ title }) => title)[0]
    : undefined
}

export function getLocalizedChangeDirection(
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

export function getChangeValue(changes: KeyFigureChanges | undefined): string | undefined {
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
export const getChangePeriod = (changes: KeyFigureChanges | undefined): string | undefined =>
  changes?.changePeriod ? changes.changePeriod.toLowerCase().replace('endring ', '') : undefined

export function parseKeyFigureText(
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
