import { getRssItemsNews } from '/lib/ssb/rss/news'

function get(): XP.Response {
  const xml = getRssItemsNews()
  return {
    body: xml,
    contentType: 'text/xml',
  }
}
exports.get = get
