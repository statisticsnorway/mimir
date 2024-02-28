import { PublicationResult } from '/lib/ssb/parts/publicationArchive'

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
