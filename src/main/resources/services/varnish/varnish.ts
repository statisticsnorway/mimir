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
    body: {
      rewriteRules: parseRules(varnishContent)
    },
    contentType: 'application/json'
  }
}

exports.get = get

function parseRules(varnish: Content<RewriteVarnish>): Array<RewriteRule> {
  if (varnish && varnish.data && varnish.data.requests) {
    const requests: RewriteVarnish['requests'] = Array.isArray(varnish.data.requests) ? varnish.data.requests : [varnish.data.requests]
    return requests.reduce((list: Array<RewriteRule>, request) => {
      if (request.enableRule && request.requestUrl) {
        list.push({
          requestUrl: request.requestUrl
        })
      }
      return list
    }, [])
  }
  return []
}

interface RewriteRule {
  requestUrl: string;
}
