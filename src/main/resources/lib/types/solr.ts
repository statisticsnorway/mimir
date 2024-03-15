export interface SolrQueryParams {
  query: string
}

export interface SolrResponse {
  status: number
  body: string | null
}

export interface PreparedSearchResult {
  id?: string
  title: string
  preface: string
  contentType: string
  url: string
  mainSubject: string
  secondaryMainSubject: string
  publishDate: string
  publishDateHuman: string | undefined
}

export interface SolrPrepResultAndTotal {
  total: number
  hits: Array<PreparedSearchResult>
  contentTypes: Array<Facet>
  subjects: Array<Facet>
}

export interface SolrResult {
  responseHeader: {
    status: number
    QTime: number
    params: {
      q: string
    }
  }
  grouped: {
    gruppering: {
      matches: number
      ngroups: number
      groups: Array<SolrGroup>
    }
  }
  // eslint-disable-next-line camelcase
  facet_counts: {
    // eslint-disable-next-line camelcase
    facet_queries: {
      uke: number
      maned: number
      ar: number
      '5ar': number
      udatert: number
    }
    // eslint-disable-next-line camelcase
    facet_fields: {
      innholdstype: Array<string | number>
      hovedemner: Array<string | number>
    }
  }
  highlighting: {
    [key: string]: SolrHighlighting
  }
}

export interface SolrHighlighting {
  tittel: Array<string>
  innhold: Array<string>
}

export interface SolrGroup {
  doclist: DocList
  kating: Array<DocList>
  groupValue: number
}

export interface DocList {
  docs: Array<SolrDoc>
  numFound: number
  start: number
}

export interface SolrDoc {
  url: string
  id: string
  tittel: string
  innholdstype: string
  publiseringsdato: string
  'om-statistikken': string
  undertittel: string
  hovedemner: string
  sprak: string
  rom: string
}

export interface Facet {
  title: string
  count: number
}
