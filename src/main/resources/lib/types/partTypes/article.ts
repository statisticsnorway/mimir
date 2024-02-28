import { AssociatedLink } from '/lib/types/article'
import { Phrases } from '/lib/types/language'
import { Article } from '/site/content-types'

export interface ArticleProps {
  phrases: Phrases | undefined
  introTitle: string | undefined
  title: string
  preface: string | undefined
  bodyText: string | undefined
  showPubDate: boolean
  pubDate: string | undefined
  modifiedDate: string | undefined
  authors: Article['authorItemSet'] | undefined
  serialNumber: string | undefined
  associatedStatistics: Array<AssociatedLink> | []
  associatedArticleArchives: Array<AssociatedLink> | []
  isbn: string | undefined
}
