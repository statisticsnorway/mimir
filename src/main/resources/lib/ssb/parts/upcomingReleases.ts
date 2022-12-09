import type { Content } from '/lib/xp/content'
import { connect, multiRepoConnect, type MultiRepoConnection, type MultiRepoNodeQueryResponse } from '/lib/xp/node'
import { type Context, type ContextAttributes, get as getContext, type PrincipalKey } from '/lib/xp/context'
import { pageUrl } from '/lib/xp/portal'
import { getMainSubjectById, getMainSubjects, SubjectItem } from '../utils/subjectUtils'
import { type UpcomingRelease } from '/site/content-types'
import { ContentLight, Release } from '../repo/statisticVariant'
import { formatDate } from '../utils/dateUtils'
import { localize } from '/lib/xp/i18n'
import { addDays } from 'date-fns'
import { getMainSubject } from '../utils/parentUtils'

const { moment } = __non_webpack_require__('/lib/vendor/moment')

export function getUpcomingReleasesResults(req: XP.Request, numberOfDays: number, language: string) {
  const allMainSubjects: Array<SubjectItem> = getMainSubjects(req, language)
  const context: Context<ContextAttributes> = getContext()

  const connection: MultiRepoConnection = multiRepoConnect({
    sources: [
      {
        repoId: context.repository,
        branch: context.branch,
        principals: context.authInfo.principals as Array<PrincipalKey>,
      },
      {
        repoId: 'no.ssb.statreg.statistics.variants',
        branch: 'master',
        principals: context.authInfo.principals as Array<PrincipalKey>,
      },
    ],
  })

  const serverOffsetInMs: number =
    app.config && app.config['serverOffsetInMs'] ? parseInt(app.config['serverOffsetInMs']) : 0
  const serverTime: Date = new Date(new Date().getTime() + serverOffsetInMs)

  const results: MultiRepoNodeQueryResponse = connection.query({
    count: 500,
    sort: [
      {
        field: 'data.nextRelease',
        direction: 'ASC',
      },
      // {
      //   field: 'data.date',
      //   direction: 'ASC',
      // },
    ] as unknown as string,
    // query: `data.date >= "${new Date().toISOString()}"
    // OR data.nextRelease >= "${moment().format('YYYY-MM-DD HH:mm:ss.S')}"`,
    query: {
      // boolean: {
      //   should: [
      //     {
      //       range: {
      //         field: 'data.nextRelease',
      //         from: 'dateTime',
      //         gte: new Date().toISOString(),
      //         lte: addDays(new Date(), numberOfDays),
      //       },
      //     },
      //     {
      //       range: {
      //         field: 'data.date',
      //         from: 'dateTime',
      //         gte: new Date().toISOString(),
      //         lte: addDays(new Date(), numberOfDays),
      //       },
      //     },
      //   ],
      // },
      range: {
        field: 'data.nextRelease',
        from: 'dateTime',
        gte: serverTime,
        lte: addDays(new Date(), numberOfDays),
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
                    field: 'data.articleType',
                    values: ['statistics'],
                  },
                },
                {
                  hasValue: {
                    field: 'data.status',
                    values: ['A'],
                  },
                },
                {
                  exists: {
                    field: 'data.statisticContentId',
                  },
                },
                {
                  exists: {
                    field: 'data.nextPeriod',
                  },
                },
              ],
            },
          },
          // contentReleases
          // {
          //   boolean: {
          //     must: [
          //       {
          //         hasValue: {
          //           field: 'type',
          //           values: [`${app.name}:upcomingRelease`],
          //         },
          //       },
          //     ],
          //   },
          // },
        ],
      },
    },
  })

  const contents: (Content<UpcomingRelease, object> | ContentLight<Release>)[] = results.hits.map((hit) =>
    connect(hit).get<Content<UpcomingRelease, object> | ContentLight<Release>>(hit.id)
  )

  const upcomingReleases: Array<UpcomingReleases> = contents.map((content) =>
    isContentUpcomingRelease(content)
      ? prepContentUpcomingRelease(content as Content<UpcomingRelease, object>, language, allMainSubjects)
      : prepStatisticUpcomingRelease(content as ContentLight<Release>, language)
  )

  return {
    total: upcomingReleases.length,
    upcomingReleases,
  }
}

function isContentUpcomingRelease(content: unknown) {
  return (content as Content).type === `${app.name}:upcomingRelease`
}

function prepContentUpcomingRelease(
  content: Content<UpcomingRelease, object>,
  language: string,
  allMainSubjects: Array<SubjectItem>
): UpcomingReleases {
  const date: string = content.data.date
  const mainSubjectItem: SubjectItem | null = getMainSubjectById(allMainSubjects, content.data.mainSubject)
  const mainSubject: string = mainSubjectItem ? mainSubjectItem.title : ''
  const contentType: string = content.data.contentType
    ? localize({
        key: `contentType.${content.data.contentType}`,
        locale: language,
      })
    : ''

  return {
    id: content._id,
    name: content.displayName,
    type: contentType,
    date: moment(date).locale(language).format(),
    mainSubject: mainSubject,
    day: formatDate(date, 'd', language) as string,
    month: formatDate(date, 'M', language) as string,
    monthName: formatDate(date, 'MMM', language) as string,
    year: formatDate(date, 'yyyy', language) as string,
    upcomingReleaseLink: content.data.href ? content.data.href : '',
  }
}

function prepStatisticUpcomingRelease(content: ContentLight<Release>, language: string): UpcomingReleases {
  const date: string = content.data.nextRelease
  return {
    id: content.data.statisticId,
    name: content.data.name,
    type: localize({
      key: `contentType.${content.data.articleType}`,
      locale: language,
    }),
    date: formatDate(date, 'PPP', language) as string,
    mainSubject: getMainSubject(content.data.shortName, language),
    day: formatDate(date, 'd', language) as string,
    month: formatDate(date, 'M', language) as string,
    monthName: formatDate(date, 'MMM', language) as string,
    year: formatDate(date, 'yyyy', language) as string,
    description: content.data.nextPeriod,
    upcomingReleaseLink: pageUrl({
      id: content.data.statisticContentId as string,
    }),
  }
}
export interface UpcomingReleasesResults {
  total: number
  upcomingReleases: Array<UpcomingReleases>
}

export interface UpcomingReleases {
  id: string
  name: string
  type: string
  date: string
  mainSubject: string
  day: string
  month: string
  monthName: string
  year: string
  description?: string
  upcomingReleaseLink?: string
}
