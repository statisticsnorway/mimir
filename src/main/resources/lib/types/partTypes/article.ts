import { type AssociatedLink } from '/lib/types/article'
import { type Phrases } from '/lib/types/language'
import { type Article } from '/site/content-types/article'

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
