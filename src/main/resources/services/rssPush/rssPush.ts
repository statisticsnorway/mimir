import { Response } from 'enonic-types/controller'

const {
  pushRssNews
} = __non_webpack_require__('/lib/ssb/cron/pushRss')

exports.get = function(): Response {
  return {
    body: pushRssNews(),
    contentType: 'text/html',
    status: 200
  }
}
