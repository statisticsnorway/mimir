import { Request, Response } from 'enonic-types/controller'
import { Component } from 'enonic-types/portal'
import { Content } from 'enonic-types/content'
import { SearchResultPartConfig } from './searchResult-part-config'
import { React4xp, React4xpResponse } from '../../../lib/types/react4xp'
import { PreparedSearchResult } from '../../../lib/ssb/utils/solrUtils'
const React4xp: React4xp = __non_webpack_require__('/lib/enonic/react4xp')
const {
  solrSearch
} = __non_webpack_require__('/lib/ssb/utils/solrUtils')

const {
  getComponent,
  getContent
} = __non_webpack_require__('/lib/xp/portal')

const {
  renderError
} = __non_webpack_require__('/lib/ssb/error/error')

exports.get = function(req: Request): React4xpResponse | Response {
  try {
    const part: Component<SearchResultPartConfig> = getComponent()
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

exports.preview = (req: Request): React4xpResponse | Response => {
  try {
    const page: Content = getContent()
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

export function renderPart(req: Request): React4xpResponse {
  log.info('Welcome to the search results')
  log.info(JSON.stringify(req, null, 2))
  if (req.params.sok) log.info(JSON.stringify(encodeURI(req.params.sok)))
  const props: ReactProps = {
    hits: req.params.sok ? solrSearch(sanitize(req.params.sok)) : [],
    title: 'Søk',
    buttonTitle: 'Flere treff',
    total: 1234
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
  buttonTitle: string;
}

