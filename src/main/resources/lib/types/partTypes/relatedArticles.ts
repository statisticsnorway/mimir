export interface RelatedArticlesContent {
  title: string
  subTitle: string
  preface: string
  href: string
  imageSrc: string
  imageAlt: string
}

export interface RelatedArticle {
  _selected: 'article'
  article: {
    article: string
  }
}
