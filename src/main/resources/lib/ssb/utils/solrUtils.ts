import { Response } from 'enonic-types/controller'
import { HttpLibrary, HttpResponse } from 'enonic-types/http'

const CHARACTER_SET: string = 'UTF-8'
const SOLR_PARAM_QUERY: string = 'q'
const SOLR_FORMAT: string = 'json'
const SOLR_PARAM_START: string = 'start'
const SOLR_ENV_URL: string = 'https://65f66ea6-f8d0-407e-9211-e917ec4a3846.mock.pstmn.io'
const SOLR_FREETEXT_BASE: string = '/solr/fritekstsok/select'

const {
  request
} = __non_webpack_require__('/lib/http-client')

export function solrSearch(term: string): Response {
  const searchResult: SolrResult | undefined = querySolr({
    query: createQuery(term)
  })
  const preparedSearchResult: Array<PreparedSearchResult> = searchResult ? prepareSearchResult(searchResult) : []
  log.info(JSON.stringify(preparedSearchResult, null, 2))
  return {
    body: preparedSearchResult
  }
}

function prepareSearchResult(solrResult: SolrResult): Array<PreparedSearchResult> {
  log.info('Nerf this')
  log.info(JSON.stringify(solrResult, null, 2))
  return solrResult.grouped.gruppering.groups.reduce((acc: Array<PreparedSearchResult>, group) => {
    group.doclist.docs.forEach((doc: SolrDoc) => {
      acc.push({
        title: doc.tittel,
        contentType: doc.innholdstype,
        url: doc.url,
        mainSubject: doc.hovedemner
      })
    })
    return acc
  }, [])
}

function querySolr(queryParams: SolrQueryParams): SolrResult | undefined {
  log.info(JSON.stringify(queryParams, null, 2))
  const solrResponse: SolrResponse = requestSolr(queryParams)
  if (solrResponse.status === 200) {
    return JSON.parse(solrResponse.body)
  } else {
    return undefined
  }
}

function requestSolr(queryParams: SolrQueryParams) {
  try {
    const result: HttpResponse = request({
      url: queryParams.query
    })
    const {
      status,
      body
    } = result
    return {
      status,
      body
    }
  } catch (e) {
    log.info(JSON.stringify(e, null, 2))
    return {
      status: e.status ? e.status : 500,
      body: e.body ? e.body : 'Internal error trying to request solr'
    }
  }
}

function createQuery(term: string): string {
  return `${SOLR_ENV_URL}${SOLR_FREETEXT_BASE}?${SOLR_PARAM_QUERY}=${term}&wt=${SOLR_FORMAT}`
}

function sanitizeTermForSolrSearch(rawText: string): string {
  return ''
}

/*
* Interfaces
*/
export interface SolrUtilsLib {
    prepareSearchResult: (solrResult: SolrResponse) => PreparedSearchResult;
    querySolr: (query: SolrQueryParams) => SolrResponse;
    solrSearch: (term: string) => Response;
}

interface SolrQueryParams {
  query: string;
}

interface SolrResponse {
  status: number;
  body: string;
}

interface PreparedSearchResult {
  title: string;
  contentType: string;
  url: string;
  mainSubject: string;
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
  facet_counts: {
    facet_queries: {
      uke: number;
      maned: number;
      ar: number;
      '5ar': number;
      udatert: number;
    };
    facet_fields: {
      innholdstype: Array<string | number>;
    };
  };
  highlighting: {
    [key: string]: {
      tittel: Array<string>;
      innhold: Array<string>;
    };
  };
}

interface Duly {
  pewpew: string;
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
