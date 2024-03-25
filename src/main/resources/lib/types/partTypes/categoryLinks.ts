export interface CategoryLink {
  titleText: string
  subText: string
  href: string
}

export interface MethodDocumentation {
  _selected: string
}

export interface DocumentationUrl extends MethodDocumentation {
  _selected: 'urlSource'
  urlSource: {
    url: string
  }
}

export interface DocumentationContent extends MethodDocumentation {
  _selected: 'relatedSource'
  relatedSource: {
    content?: string
  }
}

export interface CategoryLinksProps {
  links: CategoryLink[]
  methodsAndDocumentationUrl?: string
  methodsAndDocumentationLabel?: string
}
