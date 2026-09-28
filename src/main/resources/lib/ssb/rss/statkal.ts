import { type Request } from '@enonic-types/core'
import { type components } from '@statisticsnorway/statreg-api-types'
import { type Content, query } from '/lib/xp/content'

import {
  type ContentLight,
  type Release as ReleaseVariant,
  getStatisticsContentByRegStatId,
  getUpcompingStatisticVariantsFromRepo,
} from '/lib/ssb/repo/statisticVariant'
import { Contact, ReleasesInListing } from '/lib/ssb/dashboard/statreg/types'
import { getAllMainSubjectByContent, getMainSubjects, getSubSubjects } from '/lib/ssb/utils/subjectUtils'
import { calculatePeriod } from '/lib/ssb/utils/variantUtils'
import { addDays, isWithinInterval } from '/lib/vendor/dateFns'
import * as util from '/lib/util'
import { getContactsFromRepo } from '/lib/ssb/statreg/contacts'
import { type SubjectItem } from '/lib/types/subject'
import { isEnabled } from '/lib/featureToggle'
import { OmStatistikken, type Statistics } from '/site/content-types'
import { fetchReleasesFromStatregApi, fetchStatisticsFromStatregAPI } from '../statreg/statistics'
import { notNullOrUndefined } from '../utils/coreUtils'
import { contentArrayToRecord } from '../utils/arrayUtils'
import { formatPubDateStatistic } from './news-helpers'

const dummyReq: Partial<Request> = {
  branch: 'master',
}

function getByIds<Data extends object>(ids: Array<string>, language: 'en' | 'nb'): Record<string, Content<Data>> {
  return contentArrayToRecord(
    query<Content<Data>>({
      count: ids.length,
      filters: {
        ids: {
          values: ids,
        },
        hasValue: {
          field: 'language',
          values: language === 'en' ? ['en'] : ['nb', 'nn'],
        },
      },
    }).hits
  )
}
// TODO: Get the right number of days from config
// TODO: Caching! bling bling!

export function getRssReleasesStatkal(): RssRelease[] {
  const useNewStatreg = isEnabled('new-statreg-as-source', false, 'ssb')
  if (useNewStatreg) {
    return getRssFromApi('no').concat(getRssFromApi('en')) // TODO: Fix this travesty gosh darn it
  } else {
    return getRssFromRepo()
  }
}

function getRssFromApi(lang: string = 'nb'): RssRelease[] {
  const now = new Date()
  const date90DaysAgo = new Date(new Date(now).setDate(now.getDate() - 90))

  const futureReleases = fetchReleasesFromStatregApi({
    start: 0,
    count: 1000,
    publishTimeAfter: date90DaysAgo.toISOString(),
    publishTimeBefore: now.toISOString(),
  })

  const allStatistics = fetchStatisticsFromStatregAPI({ start: 0, count: 1000 })
  const contacts: Record<string, Array<Contact>> = {}
  allStatistics?.forEach((stat) => {
    const currentContacts: Array<components['schemas']['Contact'] | undefined> | undefined = stat.contacts || []
    const shortName = stat.shortname
    if (shortName && currentContacts && currentContacts)
      contacts[shortName] = currentContacts.map((c: components['schemas']['Contact']) => ({
        name: c.name,
        email: c.principalName,
      }))
  })

  if (!futureReleases) {
    log.error('Could not get Releases from Statreg!')
    return []
  } else {
    const allMainSubjects: SubjectItem[] = getMainSubjects(dummyReq as Request)
    const allSubSubjects: SubjectItem[] = getSubSubjects(dummyReq as Request)

    const statisticsWithReleases: string[] = []
    futureReleases.forEach((s) => {
      s.statistic?.id && statisticsWithReleases.push(s.statistic?.id?.toString())
    })

    const statisticsContents = getStatisticsContentByRegStatId(statisticsWithReleases, lang)
    const aboutTheStatisticsKeys: Array<string> = statisticsContents.hits
      .map((stat) => stat.data.aboutTheStatistics)
      .filter(notNullOrUndefined)

    const aboutTheStatistics: Record<string, Content<OmStatistikken>> = getByIds<OmStatistikken>(
      aboutTheStatisticsKeys,
      'nb'
    )
    log.info(JSON.stringify(aboutTheStatistics[Object.keys(aboutTheStatistics)[0]], null, 2))
    log.info('VI LOGGER HER OK')
    const rssReleases: RssRelease[] = []
    futureReleases?.forEach((release) => {
      const content = statisticsContents.hits.find(
        (stat) => stat.data.statistic === release.statistic?.id?.toString()
      ) as Content<Statistics>
      if (!content) {
        log.error('Content not found with release ID: ' + release.id)
        return
      }
      const aboutTheStatisticsContent: Content<OmStatistikken> | undefined = content?.data.aboutTheStatistics
        ? aboutTheStatistics[content?.data.aboutTheStatistics]
        : undefined
      const myMainSubject = getAllMainSubjectByContent(content, allMainSubjects, allSubSubjects)
      const baseUrl: string = app.config && app.config['ssb.baseUrl'] ? app.config['ssb.baseUrl'] : 'https://www.ssb.no'
      const statisticUrl = `${baseUrl}/${content._path.split('/').slice(2).join('/')}`
      const shortname = release.statistic?.shortname || ''

      rssReleases.push({
        guid: release.id?.toString() || '0',
        title: content?.displayName || 'en tittel',
        link: statisticUrl,
        description:
          aboutTheStatisticsContent?.data.ingress ??
          content?.x?.['com-enonic-app-metafields']?.['meta-data'].seoDescription,
        category: myMainSubject[0].title,
        subject: myMainSubject[0].name || 'unknown',
        language: content.language || 'nb',
        pubDate: release.publish_time || '',
        periode: 'Tall for ' + release.measuring_period?.title || '',
        shortname,
        contacts: contacts[shortname],
      })
    })
    return rssReleases
  }
}

function getRssFromRepo() {
  const allMainSubjects: SubjectItem[] = getMainSubjects(dummyReq as Request)

  const statisticVariants: ContentLight<ReleaseVariant>[] = getUpcompingStatisticVariantsFromRepo()

  const upcomingVariants: StatkalVariant[] = getUpcomingVariants(statisticVariants, allMainSubjects)
  const upcomingReleases: StatkalRelease[] = getUpcomingReleases(statisticVariants)
  return getRssReleases(upcomingVariants, upcomingReleases)
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
  releases.forEach((release: StatkalRelease) => {
    const variant: StatkalVariant = variants.filter(
      (variant) => variant.statisticId == release.statisticId && variant.language === release.language
    )[0]
    const contactsStatistic = contacts.filter((contact) => variant.contacts.includes(contact.id.toString()))
    const pubDate: string | undefined = formatPubDateStatistic(release.pubDate)
    rssReleases.push({
      guid: release.guid,
      title: variant.title,
      link: variant.link,
      description: variant.description,
      category: variant.category,
      subject: variant.subject,
      language: variant.language === 'en' ? 'en' : 'no',
      pubDate: pubDate ?? '',
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
  contacts: Contact[] | Array<components['schemas']['Contact']>
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
