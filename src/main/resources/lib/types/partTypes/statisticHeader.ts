export interface StatisticHeader extends StatisticsDates {
  title: string
  modifiedText: string | null | undefined
  modifiedDateId: string
  ingress: string
  statisticsAbout: string
  showPreviewDraft: boolean
  previewButtonUrl: string
  previewButtonText: string
}

export interface StatisticsDates {
  updatedPhrase: string
  nextUpdatePhrase: string
  changedPhrase: string
  changeDate: string | undefined
  previousRelease: string | undefined
  nextRelease: string | undefined
}
