import type { ContentLight, Release as ReleaseVariant } from '/lib/ssb/repo/statisticVariant'
import { getUpcompingStatisticVariantsFromRepo } from '/lib/ssb/repo/statisticVariant'
import { Contact, ReleasesInListing } from '/lib/ssb/dashboard/statreg/types'
import type { SubjectItem } from '/lib/ssb/utils/subjectUtils'
import { calculatePeriod } from '/lib/ssb/utils/variantUtils'
import { formatDate } from '/lib/ssb/utils/dateUtils'

const { xmlEscape } = __non_webpack_require__('/lib/text-encoding')
const {
  data: { forceArray },
} = __non_webpack_require__('/lib/util')
const { getMainSubjects } = __non_webpack_require__('/lib/ssb/utils/subjectUtils')
const { getContactsFromRepo } = __non_webpack_require__('/lib/ssb/statreg/contacts')
const { pageUrl } = __non_webpack_require__('/lib/xp/portal')

export function getStatisticCalendarRss(req: XP.Request): string {
  const statisticVariants: ContentLight<ReleaseVariant>[] = getUpcompingStatisticVariantsFromRepo()
  const allMainSubjects: Array<SubjectItem> = getMainSubjects(req)
  const upcomingVariants: StatkalVariant[] = getUpcomingVariants(statisticVariants, allMainSubjects)
  const upcomingReleases: StatkalRelease[] = getUpcomingReleases(statisticVariants)
  const rssReleases: RssRelease[] = getRssReleases(upcomingVariants, upcomingReleases)
  //TODO: Endre pubdate - <pubDate>2023-09-20T08:00:00+02:00</pubDate>

  const xml = `<?xml version="1.0" encoding="utf-8"?>
	<rssitems count="${rssReleases.length}">
	  ${[...rssReleases]
      .map(
        (r: RssRelease) => `<rssitem>
		<guid isPermalink="false">statkal-${r.guid}</guid>
		<title>${createTitle(r)}</title>
		<link>${r.link}</link>
		<description>${r.description ? xmlEscape(r.description) : ''}</description>
		<category>${r.category}</category>
		<subject>${r.subject}</subject>
		<language>${r.language}</language>${forceArray(r.contacts)
          .map(
            (c: Contact) => `<contact>
	  		<name>${c.name}</name>
	  		<email>${c.email}</email>
	  		<phone>${c.telephone}</phone>
	  	</contact>`
          )
          .join('')}
		<pubDate>${r.pubDate}</pubDate>
		<shortname>${r.shortname}</shortname>
	  </rssitem>`
      )
      .join('')}
	</rssitems>`
  return xml
}

function getUpcomingVariants(
  statisticVariants: ContentLight<ReleaseVariant>[],
  allMainSubjects: SubjectItem[]
): StatkalVariant[] {
  const variants: StatkalVariant[] = []
  statisticVariants.forEach((statisticVariant) => {
    const lang: string = statisticVariant.language === 'en' ? 'en' : 'no'
    const mainSubjectName: string | undefined = statisticVariant.data.mainSubjects
      ? forceArray(statisticVariant.data.mainSubjects)[0]
      : undefined
    const mainSubject: SubjectItem | null = mainSubjectName
      ? getMainSubject(mainSubjectName, allMainSubjects, lang)
      : null
    const baseUrl: string = app.config?.['ssb.baseUrl'] || 'https://www.ssb.no'
    const statisticUrl = statisticVariant.data.statisticContentId
      ? baseUrl +
        pageUrl({
          id: statisticVariant.data.statisticContentId,
        })
      : ''

    variants.push({
      statisticId: statisticVariant.data.statisticId,
      variantId: statisticVariant.data.variantId,
      title: statisticVariant.data.name,
      link: statisticUrl,
      description: statisticVariant.data.ingress ?? '',
      category: mainSubject ? mainSubject.title : '',
      subject: mainSubject ? mainSubject.name : '',
      language: statisticVariant.language,
      shortname: statisticVariant.data.shortName,
      contacts: statisticVariant.data.contacts,
    })
  })
  return variants
}

function getUpcomingReleases(statisticVariants: ContentLight<ReleaseVariant>[]): StatkalRelease[] {
  const releases: StatkalRelease[] = []
  statisticVariants.forEach((statisticVariant) => {
    const upcomingReleases: ReleasesInListing[] = statisticVariant.data.upcomingReleases
      ? forceArray(statisticVariant.data.upcomingReleases)
      : []

    upcomingReleases.forEach((r) => {
      releases.push({
        guid: r.id,
        statisticId: statisticVariant.data.statisticId,
        variantId: statisticVariant.data.variantId,
        language: statisticVariant.language,
        pubDate: r.publishTime,
        periode: calculatePeriod(statisticVariant.data.frequency, r.periodFrom, r.periodTo, statisticVariant.language),
      })
    })
  })
  return releases
}

function getRssReleases(variants: StatkalVariant[], releases: StatkalRelease[]): RssRelease[] {
  const rssReleases: RssRelease[] = []
  const contacts: Contact[] = getContactsFromRepo()
  releases.forEach((release: StatkalRelease) => {
    const variant: StatkalVariant = variants.filter(
      (variant) => variant.statisticId == release.statisticId && variant.language === release.language
    )[0]
    const statisticContacts: Contact[] = variant.contacts ? getContactsByIds(contacts, variant.contacts) : []
    rssReleases.push({
      guid: release.guid,
      title: variant.title,
      link: variant.link,
      description: variant.description,
      category: variant.category,
      subject: variant.subject,
      language: variant.language,
      pubDate: release.pubDate,
      periode: release.periode,
      shortname: variant.shortname,
      contacts: statisticContacts,
    })
  })
  return rssReleases
}

function getMainSubject(mainSubjectName: string, allMainSubjects: SubjectItem[], language: string): SubjectItem | null {
  const mainSubjectFiltered: SubjectItem[] = allMainSubjects.filter(
    (mainsubject) => mainsubject.name === mainSubjectName && mainsubject.language === language
  )
  if (mainSubjectFiltered.length > 0) {
    return mainSubjectFiltered[0]
  }

  return null
}

function getContactsByIds(contacts: Contact[], contactIds: string[]): Contact[] {
  return contacts.filter((contact) => contactIds.includes(contact.id.toString()))
}

function createTitle(release: RssRelease): string {
  const pattern = release.language === 'en' ? 'dd/MM/yyyy' : 'dd.MM.yyyy'
  const dateFormattet = formatDate(release.pubDate, pattern)
  return `${dateFormattet}: ${release.title}, ${release.periode}`
}

interface RssRelease {
  guid: string
  title: string
  link: string
  description: string
  category: string
  subject: string
  language: string
  pubDate: string
  periode: string
  shortname: string
  contacts: Contact[]
}

interface StatkalVariant {
  statisticId: string
  variantId: string
  title: string
  link: string
  description: string
  category: string
  subject: string
  language: string
  shortname: string
  contacts: string[]
}

interface StatkalRelease {
  guid: string
  statisticId: string
  variantId: string
  language: string
  pubDate: string
  periode: string
}
