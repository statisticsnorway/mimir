interface SelectedContentResult {
  value: string
  label: string
  title: string
}

export interface BestBetContent {
  id?: string | undefined
  linkedSelectedContentResult: SelectedContentResult
  linkedContentTitle: string | undefined
  linkedContentHref: string | undefined
  linkedContentIngress: string
  linkedContentType: string
  linkedContentDate: string
  linkedContentSubject: string
  linkedEnglishContentSubject: string
  searchWords: Array<string>
}
