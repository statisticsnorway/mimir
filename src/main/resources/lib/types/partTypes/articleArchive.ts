export interface ArticleArchiveProps {
  title: string | undefined
  preamble: string | undefined
  image: string | undefined
  imageAltText: string | undefined
  freeText: string | undefined
  issnNumber: string | undefined
  listOfArticlesSectionTitle: string
  language: string
  pageId: string
  firstArticles: ParsedArticles
  articleArchiveService: string
  showMore: string
  showMorePagination: string
}

export interface ParsedArticles {
  articles: Array<ParsedArticleData>
  total: number
}

export interface ParsedArticleData {
  preamble: string | undefined
  year: string | undefined
  subtitle: string
  href: string
  title: string
  date: string
}
