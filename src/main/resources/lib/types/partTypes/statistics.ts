export interface StatisticsProps {
  title: string
  updated: string
  nextUpdate: string
  changed: string
  changeDate: string | undefined
  modifiedText: string | null | undefined
  previousRelease: string | undefined
  nextRelease: string | undefined
  modifiedDateId: string
  statisticsKeyFigure: string | object | null | undefined
  showPreviewDraft: boolean
  draftUrl: string
  draftButtonText: string
}
