import type { ContentLight, Release as ReleaseVariant } from '/lib/ssb/repo/statisticVariant'
import { getUpcompingStatisticVariantsFromRepo } from '/lib/ssb/repo/statisticVariant'
import { ReleasesInListing } from '/lib/ssb/dashboard/statreg/types'
import type { SubjectItem } from '/lib/ssb/utils/subjectUtils'
import { Contact } from '/lib/ssb/dashboard/statreg/types'
const { xmlEscape } = __non_webpack_require__('/lib/text-encoding')
const {
  data: { forceArray },
} = __non_webpack_require__('/lib/util')
const { getMainSubjects } = __non_webpack_require__('/lib/ssb/utils/subjectUtils')
const { getContactsFromRepo } = __non_webpack_require__('/lib/ssb/statreg/contacts')

export function getStatisticCalendarRss(req: XP.Request): string {
  const statisticVariants: ContentLight<ReleaseVariant>[] = getUpcompingStatisticVariantsFromRepo()
  const allMainSubjects: Array<SubjectItem> = getMainSubjects(req)
  const upcomingVariants: StatkalVariant[] = getUpcomingVariants(statisticVariants, allMainSubjects)
  const upcomingReleases: StatkalRelease[] = getUpcomingReleases(statisticVariants)
  const rssReleases: RssRelease[] = getRssReleases(upcomingVariants, upcomingReleases)

  const xml = `<?xml version="1.0" encoding="utf-8"?>
	<rssitems count="${rssReleases.length}">
	  ${[...rssReleases]
      .map(
        (r: RssRelease) => `<rssitem>
		<guid isPermalink="false">statkal-${r.guid}</guid>
		<title>${xmlEscape(r.title)}</title>
		<link>www.ssb.no</link>
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

    variants.push({
      statisticId: statisticVariant.data.statisticId,
      variantId: statisticVariant.data.variantId,
      title: statisticVariant.data.name,
      link: '',
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
  const ferdigListe: StatkalRelease[] = []
  statisticVariants.forEach((statisticVariant) => {
    const upcomingReleases: ReleasesInListing[] = statisticVariant.data.upcomingReleases
      ? forceArray(statisticVariant.data.upcomingReleases)
      : []

    upcomingReleases.forEach((r) => {
      ferdigListe.push({
        guid: r.id,
        statisticId: statisticVariant.data.statisticId,
        variantId: statisticVariant.data.variantId,
        language: statisticVariant.language,
        pubDate: r.publishTime,
      })
    })
  })
  return ferdigListe
}

function getRssReleases(variants: StatkalVariant[], releases: StatkalRelease[]): RssRelease[] {
  const rssReleases: RssRelease[] = []
  const contacts: Contact[] = getContactsFromRepo()
  releases.forEach((release: StatkalRelease) => {
    const variant: StatkalVariant = variants.filter(
      (variant) => variant.statisticId == release.statisticId && variant.language === release.language
    )[0]
    const statisticContacts: Contact[] = variant.contacts ? geContactsByIds(contacts, variant.contacts) : []
    rssReleases.push({
      guid: release.guid,
      title: variant.title,
      link: variant.link,
      description: variant.description,
      category: variant.category,
      subject: variant.subject,
      language: variant.language,
      pubDate: release.pubDate,
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

function geContactsByIds(contacts: Contact[], contactIds: string[]): Contact[] {
  return contacts.filter((contact) => contactIds.includes(contact.id.toString()))
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
}
