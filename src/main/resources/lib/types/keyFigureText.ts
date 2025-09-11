import { type KeyFigureView } from '/lib/types/partTypes/keyFigure'

export interface KeyFigureTextContext {
  keyFigure?: string
  text: string | undefined
  overwriteIncrease: string | undefined
  overwriteDecrease: string | undefined
  overwriteNoChange: string | undefined
}

export interface KeyFigureTextValues extends KeyFigureTextContext {
  keyFigureData: KeyFigureView | undefined
  language: string | undefined
  sourceText: string | undefined
}
