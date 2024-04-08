export interface PreparedArticles {
  title: string
  preface: string
  url: string
  publishDate: string
}

export interface ArticleResult {
  total: number
  articles: Array<PreparedArticles>
}

export interface AssociatedLink {
  text: string | undefined
  href: string | undefined
}

export interface CMS {
  href?: string | undefined
  title?: string | undefined
}
