import { Content, ContentLibrary } from 'enonic-types/content'
import { Response } from 'enonic-types/controller'
import { RewriteVarnish } from '../../site/content-types/rewriteVarnish/rewriteVarnish'
const {
  query
}: ContentLibrary = __non_webpack_require__('/lib/xp/content')

function get(): Response {
  const varnishContent: Content<RewriteVarnish> = query({
    contentTypes: [`${app.name}:rewriteVarnish`],
    count: 1,
    start: 0,
    query: ''
  }).hits[0]
  return {
    body: parseRules(varnishContent),
    contentType: 'text/plain'
  }
}

exports.get = get

function parseRules(varnish: Content<RewriteVarnish>): string {
  if (varnish && varnish.data && varnish.data.requests) {
    const requests: RewriteVarnish['requests'] = Array.isArray(varnish.data.requests) ? varnish.data.requests : [varnish.data.requests]
    return requests.reduce((requestList: string, request) => {
      if (request.enableRule && request.requestUrl) {
        const requestUrl: string = request.requestUrl.startsWith('/') ? request.requestUrl.replace('/', '') : request.requestUrl
        requestList = requestList + requestUrl + '\t 1' + '\n'
      }
      return requestList
    }, '')
  }
  return ''
}


