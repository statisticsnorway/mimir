import { type KeyFigure } from '/site/parts/keyFigure'

export interface KeyFigureProps {
  displayName: KeyFigure['title']
  keyFigures: Array<KeyFigureData> | undefined
  keyFiguresDraft: Array<KeyFigureData> | undefined
  sourceLabel: string
  source: KeyFigure['source']
  columns: KeyFigure['columns']
  showPreviewDraft: boolean
  paramShowDraft: string | boolean | undefined
  draftExist: boolean
  pageTypeKeyFigure: boolean
  hiddenTitle: string
  isInStatisticsPage: boolean
  isMacro: boolean
}

export interface KeyFigureData {
  id: string
  iconUrl?: KeyFigureView['iconUrl']
  iconAltText?: KeyFigureView['iconAltText']
  number?: KeyFigureView['number']
  numberDescription?: KeyFigureView['numberDescription']
  noNumberText: KeyFigureView['noNumberText']
  size?: KeyFigureView['size']
  title: KeyFigureView['title']
  time?: KeyFigureView['time']
  changes?: KeyFigureView['changes']
  greenBox: KeyFigureView['greenBox']
  glossaryText?: KeyFigureView['glossaryText']
  glossary?: string
  source: KeyFigure['source'] | undefined
  locale?: string
}

export interface MunicipalData {
  value: number | null
  label?: string
}

export interface KeyFigureView {
  iconUrl?: string
  iconAltText?: string
  number?: string
  numberDescription?: string
  noNumberText: string
  size?: string
  title: string
  time?: string
  changes?: KeyFigureChanges
  greenBox: boolean
  glossaryText?: string
}

export interface KeyFigureChanges {
  changeDirection: 'up' | 'down' | 'same'
  changeText?: string
  changePeriod: string
  srChangeText?: string
}
