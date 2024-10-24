export interface StatisticHeader extends StatisticsDates {
  title: string
  modifiedText: string | null | undefined
  modifiedDateId: string
  ingress: string
  statisticsAbout: string
  showPreviewDraft: boolean
  previewButtonUrl: string
  previewButtonText: string
  updatedPhrase: string
  nextUpdatePhrase: string
  changedPhrase: string
}

export interface StatisticsDates {
  changeDate: string | undefined
  previousRelease: string | undefined
  nextRelease: string | undefined
}
