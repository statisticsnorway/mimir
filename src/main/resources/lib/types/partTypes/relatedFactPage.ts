export interface RelatedFactPageProps {
  firstRelatedContents: RelatedFactPages
  relatedFactPageServiceUrl: string
  partConfig: RelatedFactPageConfig | undefined
  mainTitle: string
  showAll: string
  showLess: string
  factpagePluralName: string
  showingPhrase: string
}

export interface RelatedFactPages {
  relatedFactPages: Array<RelatedFactPageContent>
  total: number
}

export interface RelatedFactPageConfig {
  inputType?: string
  contentIdList?: string | Array<string>
}

export interface RelatedFactPageContent {
  link: string
  image: string
  imageAlt: string
  title: string
}
