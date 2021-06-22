import { Request, Response } from 'enonic-types/controller'
import { Component } from 'enonic-types/portal'
import { Content } from 'enonic-types/content'
import { SearchResultPartConfig } from './searchResult-part-config'
import { React4xp, React4xpResponse } from '../../../lib/types/react4xp'
import { PreparedSearchResult, SolrPrepResultAndTotal } from '../../../lib/ssb/utils/solrUtils'
const React4xp: React4xp = __non_webpack_require__('/lib/enonic/react4xp')
const {
  solrSearch
} = __non_webpack_require__('/lib/ssb/utils/solrUtils')

const {
  getComponent,
  getContent,
  pageUrl,
  serviceUrl
} = __non_webpack_require__('/lib/xp/portal')

const {
  renderError
} = __non_webpack_require__('/lib/ssb/error/error')

// todo
// gjør om til engelsk
// legg til muligheten for å configurere antall treff
// legg til sanitizing

exports.get = function(req: Request): React4xpResponse | Response {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

exports.preview = (req: Request): React4xpResponse | Response => {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

export function renderPart(req: Request): React4xpResponse {
  const content: Content = getContent()
  const part: Component<SearchResultPartConfig> = getComponent()
  const sanitizedTerm: string | undefined = req.params.sok ? sanitize(req.params.sok) : undefined
  const searchPageUrl: string = part.config.searchResultPage ? pageUrl({
    id: part.config.searchResultPage
  }) : content._path
  const count: number = part.config.numberOfHits ? parseInt(part.config.numberOfHits) : 15
  const solrResult: SolrPrepResultAndTotal = sanitizedTerm ?
    solrSearch( sanitizedTerm, (content.language ? content.language : 'nb'), parseInt(part.config.numberOfHits)) : {
      total: 0,
      hits: []
    }
  const props: ReactProps = {
    hits: solrResult.hits,
    total: solrResult.total,
    term: sanitizedTerm ? sanitizedTerm : '',
    count,
    title: 'Søk',
    buttonTitle: 'Flere treff',
    showingPhrase: 'Viser {0} av ',
    searchServiceUrl: serviceUrl({
      service: 'freeTextSearch'
    }),
    searchPageUrl
  }
  return React4xp.render('site/parts/searchResult/searchResultView', props, req)
}


function sanitize(term: string): string {
  return term.replace('\'', '')
}


interface ReactProps {
  hits: Array<PreparedSearchResult>;
  title: string;
  total: number;
  count: number;
  term: string;
  buttonTitle: string;
  showingPhrase: string;
  searchServiceUrl: string;
  searchPageUrl: string;
}

