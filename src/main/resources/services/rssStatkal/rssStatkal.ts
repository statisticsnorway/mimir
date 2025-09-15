import { getRssReleasesStatkal } from '/lib/ssb/rss/statkal'

export function get(): XP.Response {
  return {
    body: getRssReleasesStatkal(),
    contentType: 'application/json',
  }
}
