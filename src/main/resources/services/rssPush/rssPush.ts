import { Request, Response } from 'enonic-types/controller'

const {
  pushRssNews
} = __non_webpack_require__('/lib/ssb/cron/pushRss')

exports.get = function(/* req: Request */): Response {
  return {
    body: pushRssNews(),
    // body: 'ITSA ME, DARIO',
    contentType: 'text/html',
    status: 200
  }
}
