import { KeyFigureView } from '/lib/ssb/parts/keyFigure'
import { KeyFigure } from '/site/content-types/keyFigure'

export interface KeyFigureProps {
  displayName: KeyFigure['title']
  keyFigures: Array<KeyFigureData> | undefined
  keyFiguresDraft: Array<KeyFigureData> | undefined
  sourceLabel: string
  source: KeyFigure['source']
  columns: KeyFigure['columns']
  showPreviewDraft: boolean
  paramShowDraft: string | undefined
  draftExist: boolean
  pageTypeKeyFigure: boolean
  hiddenTitle: string
  isInStatisticsPage: boolean
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
  source: object | undefined
}
