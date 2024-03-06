export interface PublicationArchiveProps {
  title: string
  ingress: string
  buttonTitle: string
  showingPhrase: string
  defineContentPhrase: string
  chooseSubjectPhrase: string
  chooseContentTypePhrase: string
  language: string
  publicationArchiveServiceUrl: string
  firstPublications: PublicationResult
  articleTypePhrases: {
    [key: string]: string
  }
  dropDownSubjects: Array<Dropdown>
  dropDownTypes: Array<Dropdown>
}

export interface Dropdown {
  id: string
  title: string
}

export interface PublicationResult {
  total: number
  publications: Array<PublicationItem>
}

export interface PublicationItem {
  title: string
  period?: string
  preface: string
  url: string
  publishDate: string
  publishDateHuman: string | undefined
  contentType: string
  articleType: string
  mainSubjectId: string
  mainSubject: string
  secondaryMainSubjects: Array<string>
  appName: string
}
