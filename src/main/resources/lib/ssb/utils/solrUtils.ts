import { request, HttpResponse } from '/lib/http-client'
import { formatDate } from './dateUtils'

const SOLR_PARAM_QUERY = 'q'
const SOLR_FORMAT = 'json'
const SOLR_BASE_URL: string =
  app.config && app.config['ssb.solrFreeTextSearch.baseUrl']
    ? app.config['ssb.solrFreeTextSearch.baseUrl']
    : 'https://www.ssb.no/solr/fritekstsok/select'

export function solrSearch(
  term: string,
  language: string,
  numberOfHits: number,
  start = 0,
  mainSubject: string,
  contentType: string,
  sortParam: string | undefined
): SolrPrepResultAndTotal {
  const lang: string = language === 'en' ? 'en' : 'no'
  const languageQuery = `fq=sprak${encodeURIComponent(':')}${lang}`
  // Note the use of uri encoded quotation marks, Solr needs these when a facet field is multiple words
  const contentTypeQuery = contentType ? `&fq=innholdstype${encodeURIComponent(':"' + contentType + '"')}` : ''
  const subjectQuery = mainSubject ? `&fq=hovedemner${encodeURIComponent(':"' + mainSubject + '"')}` : ''
  const sortQuery = sortParam ? `&sort=${sortParam}+desc` : ''
  const searchResult: SolrResult | undefined = querySolr({
    query: createQuery(term, numberOfHits, start, languageQuery, contentTypeQuery, subjectQuery, sortQuery),
  })
  const validFiltersContentType: Array<string> = [
    'artikkel',
    'statistikk',
    'faktaside',
    'statistikkbanktabell',
    'publikasjon',
  ]
  const inValidFiltersMainSubject: Array<string> = ['Uten emne', 'No topic']
  const facetContentTypes: Array<Facet> = searchResult
    ? createFacetsArray(searchResult.facet_counts.facet_fields.innholdstype)
    : []
  const facetMainSubjects: Array<Facet> = searchResult
    ? createFacetsArray(searchResult.facet_counts.facet_fields.hovedemner)
    : []

  return searchResult
    ? {
        hits: nerfSearchResult(searchResult, language),
        total: searchResult.grouped.gruppering.matches,
        contentTypes: facetContentTypes.filter((contentType) => validFiltersContentType.includes(contentType.title)),
        subjects: facetMainSubjects.filter((mainSubject) => !inValidFiltersMainSubject.includes(mainSubject.title)),
      }
    : {
        hits: [],
        total: 0,
        contentTypes: [],
        subjects: [],
      }
}

function nerfSearchResult(solrResult: SolrResult, language: string): Array<PreparedSearchResult> {
  return solrResult.grouped.gruppering.groups.reduce((acc: Array<PreparedSearchResult>, group) => {
    group.doclist.docs.forEach((doc: SolrDoc) => {
      const highlight: SolrHighlighting | undefined = solrResult.highlighting[doc.id]
      const mainSubjects: Array<string> = doc.hovedemner ? doc.hovedemner.split(';') : []
      const secondarySubjects: Array<string> = mainSubjects.filter((subject) => subject !== mainSubjects[0])
      acc.push({
        title: highlight.tittel ? highlight.tittel[0] : doc.tittel,
        preface: highlight.innhold ? highlight.innhold[0] : doc.tittel,
        contentType: doc.innholdstype,
        url: doc.url,
        mainSubject: mainSubjects.length > 0 ? mainSubjects[0] : '',
        secondaryMainSubject: secondarySubjects.join(';'),
        publishDate: doc.publiseringsdato,
        publishDateHuman: doc.publiseringsdato ? formatDate(doc.publiseringsdato, 'PPP', language) : '',
      })
    })
    return acc
  }, [])
}

function querySolr(queryParams: SolrQueryParams): SolrResult | undefined {
  const solrResponse: SolrResponse = requestSolr(queryParams)
  if (solrResponse.status === 200 && solrResponse.body) {
    return JSON.parse(solrResponse.body)
  } else {
    return undefined
  }
}

function requestSolr(queryParams: SolrQueryParams): SolrResponse {
  try {
    const result: HttpResponse = request({
      url: queryParams.query,
    })

    if (result.status !== 200) {
      throw new Error(
        `Could not request solr with body: ${JSON.stringify(result.body && JSON.parse(result.body), null, 2)}`
      )
    }

    return {
      status: result.status,
      body: result.body,
    }
  } catch (e) {
    log.error(`Could not request solr with parameters: ${JSON.stringify(queryParams, null, 2)}`)
    log.error(e)
    return {
      status: e.status ? e.status : 500,
      body: e.body
        ? e.body
        : {
            message: e ? e : 'Internal error trying to request solr.',
          },
    }
  }
}

function createQuery(
  term: string,
  numberOfHits: number,
  start: number,
  languageQuery: string,
  contentTypeQuery: string,
  subjectQuery: string,
  sortQuery: string
): string {
  return `${SOLR_BASE_URL}?${SOLR_PARAM_QUERY}=${term}&${languageQuery}${contentTypeQuery}${subjectQuery}&wt=${SOLR_FORMAT}&start=${start}&rows=${numberOfHits}${sortQuery}`
function createQuery(
  term: string,
  numberOfHits: number,
  start: number,
  languageQuery: string,
  contentTypeQuery: string,
  subjectQuery: string,
  sortQuery: string
): string {
  return `${SOLR_BASE_URL}?${SOLR_PARAM_QUERY}=${encodeURIComponent(
    term
  )}&${languageQuery}${contentTypeQuery}${subjectQuery}&wt=${SOLR_FORMAT}&start=${start}&rows=${numberOfHits}${sortQuery}`
}

function createFacetsArray(solrResults: Array<string | number>): Array<Facet> {
  const facets: Array<Facet> = []
  solrResults.forEach((facet, i) => {
    if (typeof facet == 'string') {
      const facetCount: string | number = solrResults[i + 1]
      facets.push({
        title: facet,
        count: +facetCount,
      })
    }
  })
  return facets
}

/*
 * Interfaces
 */
export interface SolrUtilsLib {
  solrSearch: (
    term: string,
    language: string,
    numberOfHits: number,
    start?: number,
    filter?: string,
    contentType?: string,
    sortParam?: string
  ) => SolrPrepResultAndTotal
}

interface SolrQueryParams {
  query: string
}

interface SolrResponse {
  status: number
  body: string | null
}

export interface PreparedSearchResult {
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

interface SolrResult {
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

interface SolrHighlighting {
  tittel: Array<string>
  innhold: Array<string>
}

interface SolrGroup {
  doclist: DocList
  kating: Array<DocList>
  groupValue: number
}

interface DocList {
  docs: Array<SolrDoc>
  numFound: number
  start: number
}

interface SolrDoc {
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
