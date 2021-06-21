import { Request, Response } from 'enonic-types/controller'
import { Component } from 'enonic-types/portal'
import { Content } from 'enonic-types/content'
import { SearchResultPartConfig } from './searchResult-part-config'

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

exports.get = function(req: Request): Response {
  try {
    const part: Component<SearchResultPartConfig> = getComponent()
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

exports.preview = (req: Request): Response => {
  try {
    const page: Content = getContent()
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

export function renderPart(req: Request): Response {
  log.info('Welcome to the search results')
  log.info(JSON.stringify(req, null, 2))
  if (req.params.sok) log.info(JSON.stringify(encodeURI(req.params.sok)))
  return req.params.sok ? solrSearch(sanitize(req.params.sok)) : emptySearch()
}


function sanitize(term: string): string {
  return term.replace('\'', '')
}


function emptySearch(): Response {
  return {
    body: 'search parameters empty'
  }
}


