export interface SourcesConfig {
  _selected: string
  urlSource: {
    urlText: string
    url: string
  }
  relatedSource: {
    urlText: string
    sourceSelector: string
  }
}

interface Sources {
  urlText: string
  url: string
}

export type SourceList = Array<Sources>
