import { Request } from 'enonic-types/controller'
import { React4xp, React4xpResponse } from '../../../lib/types/react4xp'
import { Content } from 'enonic-types/content'
import { Component } from 'enonic-types/portal'
import { StatisticInListing } from '../../../lib/ssb/dashboard/statreg/types'
import { GroupedBy, PreparedStatistics, YearReleases, Release } from '../../../lib/ssb/utils/variantUtils'
import { UpcomingReleasesPartConfig } from './upcomingReleases-part-config'
import { UpcomingRelease } from '../../content-types/upcomingRelease/upcomingRelease'
import { SubjectItem } from '../../../lib/ssb/utils/subjectUtils'
import { enGB, nb, nn } from 'date-fns/locale'
import { parseISO, format } from 'date-fns'

const React4xp: React4xp = __non_webpack_require__('/lib/enonic/react4xp')
const {
  getContent,
  getComponent,
  processHtml,
  serviceUrl
} = __non_webpack_require__('/lib/xp/portal')
const {
  query
} = __non_webpack_require__('/lib/xp/content')
const {
  addMonthNames,
  groupStatisticsByYearMonthAndDay,
  prepareRelease,
  filterOnComingReleases,
  getUpcomingReleases
} = __non_webpack_require__( '/lib/ssb/utils/variantUtils')
const {
  getAllStatisticsFromRepo
} = __non_webpack_require__( '/lib/ssb/statreg/statistics')
const {
  localize
} = __non_webpack_require__('/lib/xp/i18n')
const {
  fromPartCache
} = __non_webpack_require__('/lib/ssb/cache/partCache')
const {
  getMainSubjects, getMainSubjectById
} = __non_webpack_require__( '/lib/ssb/utils/subjectUtils')

exports.get = (req: Request): React4xpResponse => {
  return renderPart(req)
}

exports.preview = (req: Request): React4xpResponse => renderPart(req)

function renderPart(req: Request): React4xpResponse {
  const content: Content = getContent()
  const component: Component<UpcomingReleasesPartConfig> = getComponent()
  const currentLanguage: string = content.language ? content.language : 'nb'
  const count: number = parseInt(component.config.numberOfDays)
  const buttonTitle: string = localize({
    key: 'button.showMore',
    locale: currentLanguage
  })
  const statisticsPageUrlText: string = localize({
    key: 'upcomingReleases.statisticsPageText',
    locale: currentLanguage
  })
  const upcomingReleasesServiceUrl: string = serviceUrl({
    service: 'upcomingReleases'
  })
  const allMainSubjects: Array<SubjectItem> = getMainSubjects(req, content.language === 'en' ? 'en' : 'nb' )

  const groupedWithMonthNames: Array<YearReleases> = fromPartCache(req, `${content._id}-upcomingReleases`, () => {
    // Get statistics
    const statistics: Array<StatisticInListing> = getAllStatisticsFromRepo()
    const upComingReleases: Array<Release> = getUpcomingReleases(statistics)

    // All statistics published today, and fill up with previous releases.
    const releasesFiltered: Array<Release> = filterOnComingReleases(upComingReleases, count)

    // Choose the right variant and prepare the date in a way it works with the groupBy function
    const releasesPrepped: Array<PreparedStatistics> = releasesFiltered.map((release: Release) =>
      prepareRelease(release, currentLanguage))

    // group by year, then month, then day
    const groupedByYearMonthAndDay: GroupedBy<GroupedBy<GroupedBy<PreparedStatistics>>> = groupStatisticsByYearMonthAndDay(releasesPrepped)

    // iterate and format month names
    // const groupedWithMonthNames: Array<YearReleases> = addMonthNames(groupedByYearMonthAndDay, currentLanguage)

    return addMonthNames(groupedByYearMonthAndDay, currentLanguage)
  })

  const contentReleases: Array<PreparedUpcomingRelease> = query<UpcomingRelease>({
    start: 0,
    count: 500,
    query: `type = "${app.name}:upcomingRelease" AND language = "${currentLanguage}" AND data.date >= "${format(new Date(), 'yyyy-MM-dd')}"`
  }).hits.map((r) => {
    const date: Date = parseISO(r.data.date)
    const locale: object | undefined = {
      locale: currentLanguage === 'en' ? enGB : (currentLanguage === 'nn' ? nn : nb)
    }
    const mainSubjectItem: SubjectItem | null = getMainSubjectById(allMainSubjects, r.data.mainSubject)
    const mainSubject: string = mainSubjectItem ? mainSubjectItem.title : ''
    const contentType: string = r.data.contentType ? localize({
      key: `contentType.${r.data.contentType}`,
      locale: currentLanguage
    }) : ''

    return {
      id: r._id,
      name: r.displayName,
      type: contentType,
      date: format(date, '', locale),
      mainSubject: mainSubject,
      day: format(date, 'D', locale),
      month: format(date, 'M', locale),
      monthName: format(date, 'MMM', locale),
      year: format(date, 'yyyy', locale),
      upcomingReleaseLink: r.data.href ? r.data.href : ''
    }
  })

  const props: PartProps = {
    title: content.displayName,
    releases: groupedWithMonthNames,
    preface: component.config.preface ? processHtml({
      value: component.config.preface
    }) : undefined,
    language: currentLanguage,
    count,
    upcomingReleasesServiceUrl,
    buttonTitle,
    statisticsPageUrlText,
    contentReleases
  }

  return React4xp.render('site/parts/upcomingReleases/upcomingReleases', props, req)
}

/*
*  Interfaces
*/
interface PartProps {
  releases: Array<YearReleases>;
  title?: string;
  preface?: string;
  language: string;
  count: number;
  upcomingReleasesServiceUrl: string;
  buttonTitle: string;
  statisticsPageUrlText: string;
  contentReleases: Array<PreparedUpcomingRelease>;
}
interface PreparedUpcomingRelease {
  id: string;
  name: string;
  type: string;
  date: string;
  mainSubject: string;
  day: string;
  month: string;
  monthName: string;
  year: string;
  upcomingReleaseLink?: string;
}
