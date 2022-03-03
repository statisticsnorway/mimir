import { HttpResponse } from '/lib/http-client' 
import { formatDate } from './dateUtils'

const SOLR_PARAM_QUERY: string = 'q'
const SOLR_FORMAT: string = 'json'
const SOLR_BASE_URL: string = app.config && app.config['ssb.solrFreeTextSearch.baseUrl'] ? app.config['ssb.solrFreeTextSearch.baseUrl'] :
  'https://www.ssb.no/solr/fritekstsok/select'


const {
  request
} = __non_webpack_require__('/lib/http-client')

export function solrSearch(term: string,
  language: string,
  numberOfHits: number,
  start: number = 0,
  mainSubject: string,
  contentType: string): SolrPrepResultAndTotal {
  const lang: string = language === 'en' ? 'en' : 'no'
  const filterQuery: string = mainSubject ? `fq=sprak:"${lang}"&fq=hovedemner:"${mainSubject}"` : `fq=sprak:"${lang}"`
  const contentTypeQuery: string = contentType ? `&fq=innholdstype:"${contentType}"` : ''
  const searchResult: SolrResult | undefined = querySolr({
    query: createQuery(term, numberOfHits, start, filterQuery, contentTypeQuery)
  })
  return searchResult ? {
    hits: nerfSearchResult(searchResult, language),
    total: searchResult.grouped.gruppering.matches,
    contentTypes: searchResult.facet_counts.facet_fields.innholdstype
  } : {
    hits: [],
    total: 0,
    contentTypes: []
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
        publishDateHuman: doc.publiseringsdato ? formatDate(doc.publiseringsdato, 'PPP', language) : ''
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
      url: queryParams.query
    })

    if (result.status !== 200) {
      throw new Error(`Could not request solr with body: ${JSON.stringify(result.body && JSON.parse(result.body), null, 2)}`)
    }

    return {
      status: result.status,
      body: result.body
    }
  } catch (e) {
    log.error(`Could not request solr with parameters: ${JSON.stringify(queryParams, null, 2)}`)
    log.error(e)
    return {
      status: e.status ? e.status : 500,
      body: e.body ? e.body : {
        message: e ? e : 'Internal error trying to request solr.'
      }
    }
  }
}


function createQuery(term: string, numberOfHits: number, start: number, filterQuery: string, contentTypeQuery: string): string {
  return `${SOLR_BASE_URL}?${SOLR_PARAM_QUERY}=${term}&${filterQuery}${contentTypeQuery}&wt=${SOLR_FORMAT}&start=${start}&rows=${numberOfHits}`
}

/*
* Interfaces
*/
export interface SolrUtilsLib {
    solrSearch: (term: string, language: string, numberOfHits: number, start?: number, filter?: string, contentType?: string) => SolrPrepResultAndTotal;
}

interface SolrQueryParams {
  query: string;
}

interface SolrResponse {
  status: number;
  body: string | null;
}

export interface PreparedSearchResult {
  title: string;
  preface: string;
  contentType: string;
  url: string;
  mainSubject: string;
  secondaryMainSubject: string;
  publishDate: string;
  publishDateHuman: string | undefined;
}

export interface SolrPrepResultAndTotal {
  total: number;
  hits: Array<PreparedSearchResult>;
  contentTypes: Array<string|number>;
}

interface SolrResult {
  responseHeader: {
    status: number;
    QTime: number;
    params: {
      q: string;
    };
  };
  grouped: {
    gruppering: {
      matches: number;
      ngroups: number;
      groups: Array<SolrGroup>;
    };
  };
  // eslint-disable-next-line camelcase
  facet_counts: {
    // eslint-disable-next-line camelcase
    facet_queries: {
      uke: number;
      maned: number;
      ar: number;
      '5ar': number;
      udatert: number;
    };
    // eslint-disable-next-line camelcase
    facet_fields: {
      innholdstype: Array<string | number>;
    };
  };
  highlighting: {
    [key: string]: SolrHighlighting;
  };
}

interface SolrHighlighting {
  tittel: Array<string>;
  innhold: Array<string>;
}

interface SolrGroup {
  doclist: DocList;
  kating: Array<DocList>;
  groupValue: number;
}

interface DocList {
  docs: Array<SolrDoc>;
  numFound: number;
  start: number;
}

interface SolrDoc {
  url: string;
  id: string;
  tittel: string;
  innholdstype: string;
  publiseringsdato: string;
  'om-statistikken': string;
  undertittel: string;
  hovedemner: string;
  sprak: string;
  rom: string;
}
