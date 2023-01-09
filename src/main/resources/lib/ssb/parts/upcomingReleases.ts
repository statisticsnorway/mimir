import { type Content, type QueryDSL, query } from '/lib/xp/content'
import { getStatisticVariantsFromRepo } from '/lib/ssb/repo/statisticVariant'
import { pageUrl } from '/lib/xp/portal'
import { getMainSubjectById, getMainSubjects, SubjectItem } from '../utils/subjectUtils'
import { type UpcomingRelease } from '/site/content-types'
import { ContentLight, Release } from '../repo/statisticVariant'
import { localize } from '/lib/xp/i18n'
import { addDays, getDate, getMonth, getYear, isWithinInterval } from 'date-fns'
import { getMainSubject } from '../utils/parentUtils'
import { forceArray } from '../utils/arrayUtils'
import { PreparedStatistics } from '../utils/variantUtils'
import { stringToServerTime } from '../utils/dateUtils'

export function getUpcomingReleasesResults(req: XP.Request, numberOfDays: number | undefined, language: string) {
  const allMainSubjects: Array<SubjectItem> = getMainSubjects(req, language)
  const endDate: Date | undefined = numberOfDays ? addDays(stringToServerTime(), numberOfDays) : undefined

  const results = getStatisticVariantsFromRepo(language, {
    range: {
      field: 'data.nextRelease',
      from: 'dateTime',
      gte: stringToServerTime(),
      lte: endDate,
    },
  } as unknown as QueryDSL)

  const upcomingStatisticsReleases: Array<PreparedStatistics> = results.map((statistic) =>
    prepStatisticUpcomingRelease(statistic as ContentLight<Release>, language)
  )

  const filteredUpcomingReleasesStatistics = results
    .map((statistic) =>
      filterUpcomingReleasesStatistics(statistic as ContentLight<Release>, language, stringToServerTime(), endDate)
    )
    .reduce((acc, curr) => {
      if (curr.length) return acc.concat(curr)
      else return acc
    }, [])

  const upcomingReleases = [
    ...upcomingStatisticsReleases,
    ...(filteredUpcomingReleasesStatistics as Array<PreparedStatistics>),
    ...prepContentUpcomingReleases(stringToServerTime(), endDate, allMainSubjects, language),
  ].sort((a, b) => {
    return new Date(a.date as string).getTime() - new Date(b.date as string).getTime()
  })

  return {
    total: upcomingReleases.length,
    upcomingReleases: upcomingReleases,
  }
}

function prepContentUpcomingReleases(
  serverTime: Date,
  endDate: Date | undefined,
  allMainSubjects: Array<SubjectItem>,
  language: string
): Array<PreparedStatistics> | [] {
  const oldContentUpcomingReleases: Array<PreparedStatistics> = query<UpcomingRelease, object>({
    count: 500,
    query: {
      range: {
        field: 'data.date',
        from: 'dateTime',
        gte: serverTime,
        lte: endDate,
      },
    } as unknown as string,
    filters: {
      boolean: {
        must: [
          {
            hasValue: {
              field: 'language',
              values: language === 'nb' ? ['nb', 'nn'] : ['en'],
            },
          },
        ],
        should: [
          {
            boolean: {
              must: [
                {
                  hasValue: {
                    field: 'type',
                    values: [`${app.name}:upcomingRelease`],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  }).hits.map((r: Content<UpcomingRelease, object>) => {
    const date: string = r.data.date ? r.data.date : new Date().toISOString()
    const mainSubjectItem: SubjectItem | null = getMainSubjectById(allMainSubjects, r.data.mainSubject)
    const mainSubject: string = mainSubjectItem ? mainSubjectItem.title : ''
    const contentType: string = r.data.contentType
      ? localize({
          key: `contentType.${r.data.contentType}`,
          locale: language,
        })
      : ''

    return {
      id: r._id,
      name: r.displayName,
      type: contentType,
      date,
      mainSubject: mainSubject,
      variant: {
        day: getDate(new Date(date)),
        monthNumber: getMonth(new Date(date)),
        year: getYear(new Date(date)),
      },
      statisticsPageUrl: r.data.href ? r.data.href : '',
    }
  })

  return oldContentUpcomingReleases.length ? oldContentUpcomingReleases : []
}

function parseUpcomingStatistics(
  statisticData: ContentLight<Release>['data'],
  language: string,
  date: string,
  period: string
): PreparedStatistics {
  return {
    id: Number(statisticData.statisticId),
    name: statisticData.name,
    type: localize({
      key: `contentType.${statisticData.articleType}`,
      locale: language,
    }),
    date,
    mainSubject: getMainSubject(statisticData.shortName, language),
    variant: {
      id: statisticData.statisticId,
      day: getDate(new Date(date)),
      monthNumber: getMonth(new Date(date)),
      year: getYear(new Date(date)),
      period: period,
      frequency: statisticData.frequency,
    },
    statisticsPageUrl: pageUrl({
      id: statisticData.statisticContentId as string,
    }),
  }
}

function filterUpcomingReleasesStatistics(
  content: ContentLight<Release>,
  language: string,
  startDate: Date,
  endDate: Date | undefined
): Array<PreparedStatistics | []> {
  const filteredPreparedStatistics = content.data.upcomingReleases
    ? endDate
      ? forceArray(content.data.upcomingReleases).filter((release) =>
          isWithinInterval(new Date(release.publishTime), { start: startDate, end: endDate })
        )
      : forceArray(content.data.upcomingReleases)
    : []
  if (filteredPreparedStatistics && filteredPreparedStatistics.length > 1) {
    // remove the first upcoming release as it will have the same publishTime as the statistics' nextPeriod
    filteredPreparedStatistics.shift()
    return filteredPreparedStatistics.map((release) => {
      const date = release.publishTime
      return parseUpcomingStatistics(content.data, language, date, release.period)
    })
  }
  return []
}

function prepStatisticUpcomingRelease(content: ContentLight<Release>, language: string): PreparedStatistics {
  const date: string = content.data.nextRelease
  return parseUpcomingStatistics(content.data, language, date, content.data.nextPeriod)
}
export interface PreparedStatisticsResults {
  total: number
  upcomingReleases: Array<PreparedStatistics>
}
