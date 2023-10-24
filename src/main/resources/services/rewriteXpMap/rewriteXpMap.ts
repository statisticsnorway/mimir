import { query, Content } from '/lib/xp/content'
import { type RewriteVarnish } from '/site/content-types'

function get(): XP.Response {
  const varnishContent: Content<RewriteVarnish> = query({
    contentTypes: [`${app.name}:rewriteVarnish`],
    count: 1,
    start: 0,
    query: '',
  }).hits[0]
  return {
    body: parseRules(varnishContent),
    contentType: 'text/plain;charset=utf-8',
  }
}

exports.get = get

function parseRules(varnish: Content<RewriteVarnish>): string {
  if (varnish && varnish.data && varnish.data.requests) {
    const requests: RewriteVarnish['requests'] = Array.isArray(varnish.data.requests)
      ? varnish.data.requests
      : [varnish.data.requests]
    return requests.reduce((list: string, request) => {
      if (request.enableRule && request.requestUrl) {
        const requestUrl: string = request.requestUrl.startsWith('/')
          ? request.requestUrl.replace('/', '')
          : request.requestUrl
        list = list + requestUrl + '\t 1' + '\n'
      }
      return list
    }, '')
  }
  return ''
}
