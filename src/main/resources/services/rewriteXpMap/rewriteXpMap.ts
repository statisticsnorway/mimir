import { Content } from '/lib/xp/content'
import { RewriteVarnish } from '../../site/content-types/rewriteVarnish/rewriteVarnish'
const {
  query
} = __non_webpack_require__('/lib/xp/content')

function get(): XP.Response {
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
    return requests.reduce((list: string, request) => {
      if (request.enableRule && request.requestUrl) {
        const requestUrl: string = request.requestUrl.startsWith('/') ? request.requestUrl.replace('/', '') : request.requestUrl
        list = list + requestUrl + '\t 1' + '\n'
      }
      return list
    }, '')
  }
  return ''
}


