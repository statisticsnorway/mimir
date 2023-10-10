import { pushRssNews } from '/lib/ssb/cron/pushRss'

export function get(): XP.Response {
  return {
    body: pushRssNews(),
    contentType: 'text/html',
    status: 200,
  }
}
