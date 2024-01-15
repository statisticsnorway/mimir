import {
  type ContentLight,
  type Release as ReleaseVariant,
  getUpcompingStatisticVariantsFromRepo,
} from '/lib/ssb/repo/statisticVariant'
import { Contact, ReleasesInListing } from '/lib/ssb/dashboard/statreg/types'
import { type SubjectItem, getMainSubjects } from '/lib/ssb/utils/subjectUtils'
import { calculatePeriod } from '/lib/ssb/utils/variantUtils'
import { format, formatDate, getTimeZoneIso, parseISO, addDays, isWithinInterval } from '/lib/ssb/utils/dateUtils'

// @ts-ignore
import { xmlEscape } from '/lib/text-encoding'
import * as util from '/lib/util'
import { getContactsFromRepo } from '/lib/ssb/statreg/contacts'

const dummyReq: Partial<XP.Request> = {
  branch: 'master',
}

export function getRssItemsStatkal(): string | null {
  const statisticVariants: ContentLight<ReleaseVariant>[] = getUpcompingStatisticVariantsFromRepo()
  const allMainSubjects: SubjectItem[] = getMainSubjects(dummyReq as XP.Request)
  const upcomingVariants: StatkalVariant[] = getUpcomingVariants(statisticVariants, allMainSubjects)
  const upcomingReleases: StatkalRelease[] = getUpcomingReleases(statisticVariants)
  const rssReleases: RssRelease[] = getRssReleases(upcomingVariants, upcomingReleases)

  const xml = rssReleases
    ? `<?xml version="1.0" encoding="utf-8"?>
	<rssitems count="${rssReleases.length}">
	  ${[...rssReleases]
      .map(
        (r: RssRelease) => `<rssitem>
		<guid isPermalink="false">release-${r.guid}-${r.language}</guid>
		<title>${xmlEscape(createTitle(r))}</title>
		<link>${r.link}</link>
		<description>${xmlEscape(r.description)}</description>
		<category>${xmlEscape(r.category)}</category>
		<subject>${r.subject}</subject>
		<language>${r.language}</language>
		${r.contacts
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
    : null
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
      ? util.data.forceArray(statisticVariant.data.mainSubjects)[0]
      : undefined
    const mainSubject: SubjectItem | null = mainSubjectName
      ? getMainSubject(mainSubjectName, allMainSubjects, lang)
      : null

    const baseUrl: string = app.config && app.config['ssb.baseUrl'] ? app.config['ssb.baseUrl'] : 'https://www.ssb.no'
    const statisticUrl = `${baseUrl}/${statisticVariant.data.statisticPath}`

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
      contacts: statisticVariant.data.contacts ? util.data.forceArray(statisticVariant.data.contacts) : [],
    })
  })
  return variants
}

function getUpcomingReleases(statisticVariants: ContentLight<ReleaseVariant>[]): StatkalRelease[] {
  const rssStatkalDays: number =
    app.config && app.config['ssb.rss.statkal.days'] ? app.config['ssb.rss.statkal.days'] : 120
  const endDate: Date = addDays(new Date(), rssStatkalDays)
  const releases: StatkalRelease[] = []
  statisticVariants.forEach((statisticVariant) => {
    const allReleases: ReleasesInListing[] = statisticVariant.data.upcomingReleases
      ? util.data.forceArray(statisticVariant.data.upcomingReleases)
      : []
    const upcomingReleases: ReleasesInListing[] = allReleases.filter((release) =>
      isWithinInterval(new Date(release.publishTime), {
        start: new Date(),
        end: endDate.setHours(23, 59, 59, 999),
      })
    )

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
  const serverOffsetInMinutes: number = parseInt(app.config?.['serverOffsetInMs']) || 0
  const timeZoneIso: string = getTimeZoneIso(serverOffsetInMinutes)
  releases.forEach((release: StatkalRelease) => {
    const variant: StatkalVariant = variants.filter(
      (variant) => variant.statisticId == release.statisticId && variant.language === release.language
    )[0]
    const contactsStatistic = contacts.filter((contact) => variant.contacts.includes(contact.id.toString()))
    const pubDate: string = format(parseISO(release.pubDate), "yyyy-MM-dd'T'HH:mm:ss")
    rssReleases.push({
      guid: release.guid,
      title: variant.title,
      link: variant.link,
      description: variant.description,
      category: variant.category,
      subject: variant.subject,
      language: variant.language === 'en' ? 'en' : 'no',
      pubDate: `${pubDate}${timeZoneIso}`,
      periode: release.periode,
      shortname: variant.shortname,
      contacts: util.data.forceArray(contactsStatistic),
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

function createTitle(release: RssRelease): string {
  const pattern = release.language === 'en' ? 'dd/MM/yyyy' : 'dd.MM.yyyy'
  const dateFormattet = formatDate(release.pubDate, pattern, release.language)
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
