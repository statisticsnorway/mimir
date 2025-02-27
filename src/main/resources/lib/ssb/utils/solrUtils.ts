import { sanitizeHtml } from '/lib/xp/portal'
import { localize } from '/lib/xp/i18n'
import { request, HttpResponse } from '/lib/http-client'
import { formatDate } from '/lib/ssb/utils/dateUtils'
import {
  type Facet,
  type PreparedSearchResult,
  type SolrDoc,
  type SolrHighlighting,
  type SolrPrepResultAndTotal,
  type SolrQueryParams,
  type SolrResponse,
  type SolrResult,
} from '/lib/types/solr'

const SOLR_PARAM_QUERY = 'q'
const SOLR_FORMAT = 'json'
const SOLR_BASE_URL: string =
  app.config?.['ssb.solrFreeTextSearch.baseUrl'] || 'https://www.ssb.no/solr/fritekstsok/select'

export function solrSearch(
  term: string,
  language: string,
  numberOfHits: number,
  start = 0,
  mainSubject?: string | undefined,
  contentType?: string,
  sortParam?: string | undefined
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
    'report',
    'note',
    'analysis',
    'economicTrends',
    'discussionPaper',
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

      const contentTypeTranslated = localize({
        locale: language,
        key: `contentType.search.${doc.innholdstype}`,
      })

      acc.push({
        id: doc.id,
        title: sanitizeHtml(highlight.tittel ? highlight.tittel[0] : doc.tittel),
        preface: sanitizeHtml(highlight.innhold ? highlight.innhold[0] : doc.tittel),
        contentType: contentTypeTranslated !== 'NOT_TRANSLATED' ? contentTypeTranslated : doc.innholdstype,
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
      connectionTimeout: 60000,
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
