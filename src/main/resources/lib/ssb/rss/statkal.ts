import type { ContentLight, Release as ReleaseVariant } from '/lib/ssb/repo/statisticVariant'
import { getUpcompingStatisticVariantsFromRepo } from '/lib/ssb/repo/statisticVariant'
const { xmlEscape } = __non_webpack_require__('/lib/text-encoding')
const {
  data: { forceArray },
} = __non_webpack_require__('/lib/util')

export function getStatisticCalendarRss(): string {
  const allUpcomingReleases: ContentLight<ReleaseVariant>[] = getUpcompingStatisticVariantsFromRepo()

  const xml = `<?xml version="1.0" encoding="utf-8"?>
	<rssitems count="${allUpcomingReleases.length}">
	  ${[...allUpcomingReleases]
      .map(
        (r: ContentLight<ReleaseVariant>) => `<rssitem>
		<guid isPermalink="false">statkal-${r.data.variantId}</guid>
		<title>${xmlEscape(r.data.name)}</title>
		<link>www.ssb.no</link>
		<description>${r.data.ingress ? xmlEscape(r.data.ingress) : ''}</description>
		<category>${r.data.mainSubjects}</category>
		<subject>${r.data.mainSubjects}</subject>
		<language>${r.language}</language>
		${forceArray(r.data.contacts)
      .map((c) => `<contact>${c}</contact>`)
      .join('')}
		<pubDate>${r.data.nextRelease}</pubDate>
		<shortname>${r.data.shortName}</shortname>
	  </rssitem>`
      )
      .join('')}
	</rssitems>`
  return xml
}
