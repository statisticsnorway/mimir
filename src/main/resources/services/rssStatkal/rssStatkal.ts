import { type Response } from '@enonic-types/core'
import { getRssReleasesStatkal } from '/lib/ssb/rss/statkal'

export function get(): Response {
  return {
    body: getRssReleasesStatkal(),
    contentType: 'application/json',
  }
}
