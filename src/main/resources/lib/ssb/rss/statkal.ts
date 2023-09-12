import type { ContentLight, Release as ReleaseVariant } from '/lib/ssb/repo/statisticVariant'
import { getUpcompingStatisticVariantsFromRepo } from '/lib/ssb/repo/statisticVariant'
import { ReleasesInListing } from '/lib/ssb/dashboard/statreg/types'
const { xmlEscape } = __non_webpack_require__('/lib/text-encoding')
const {
  data: { forceArray },
} = __non_webpack_require__('/lib/util')

export function getStatisticCalendarRss(): string {
  const allUpcomingReleases: ContentLight<ReleaseVariant>[] = getUpcompingStatisticVariantsFromRepo()
  const allReleases: StatkalRelease[] = upcomingReleasesTotal(allUpcomingReleases)
  //log.info(JSON.stringify(upcomingReleasesTotal(allUpcomingReleases)))

  const xml = `<?xml version="1.0" encoding="utf-8"?>
	<rssitems count="${allReleases.length}">
	  ${[...allReleases]
      .map(
        (r: StatkalRelease) => `<rssitem>
		<guid isPermalink="false">statkal-${r.guid}</guid>
		<title>${xmlEscape(r.title)}</title>
		<link>www.ssb.no</link>
		<description>${r.description ? xmlEscape(r.description) : ''}</description>
		<category>${r.category}</category>
		<subject>${r.subject}</subject>
		<language>${r.language}</language>
		${forceArray(r.contacts)
      .map((c) => `<contact>${c}</contact>`)
      .join('')}
		<pubDate>${r.pubDate}</pubDate>
		<shortname>${r.shortname}</shortname>
	  </rssitem>`
      )
      .join('')}
	</rssitems>`
  return xml
}

function upcomingReleasesTotal(statisticVariants: ContentLight<ReleaseVariant>[]): StatkalRelease[] {
  const ferdigListe: StatkalRelease[] = []
  statisticVariants.forEach((statisticVariant) => {
    const upcomingReleases: ReleasesInListing[] = statisticVariant.data.upcomingReleases
      ? forceArray(statisticVariant.data.upcomingReleases)
      : []

    upcomingReleases.forEach((r) => {
      ferdigListe.push({
        guid: r.id,
        title: statisticVariant.data.name,
        link: '',
        description: statisticVariant.data.ingress ?? '',
        category: 'Test',
        subject: 'Test',
        language: statisticVariant.language,
        pubDate: r.publishTime,
        shortname: statisticVariant.data.shortName,
        contacts: statisticVariant.data.contacts,
      })
    })
  })
  return ferdigListe
}

interface StatkalRelease {
  guid: string
  title: string
  link: string
  description: string
  category: string
  subject: string
  language: string
  pubDate: string
  shortname: string
  contacts: string[]
}
