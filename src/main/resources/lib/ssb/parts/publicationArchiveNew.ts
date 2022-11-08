import type { Article } from '../../../site/content-types/article/article'
import type { Content, QueryDSL } from '/lib/xp/content'
import { pageUrl } from '/lib/xp/portal'
import { getMainSubjects, getSubSubjects, getMainSubjectBySubSubject, type SubjectItem } from '../utils/subjectUtils'
import { formatDate } from '../utils/dateUtils'
import type { XData } from '../../../site/x-data'
import { forceArray } from '../utils/arrayUtils'
import { connect, multiRepoConnect, type MultiRepoConnection, type MultiRepoNodeQueryResponse } from '/lib/xp/node'
import { get as getContext, type Context, type ContextAttributes, type PrincipalKey } from '/lib/xp/context'
import type { ContentLight, Release } from '/lib/ssb/repo/statisticVariant'
import { notEmptyOrUndefined } from '/lib/ssb/utils/coreUtils'

const { moment } = __non_webpack_require__('/lib/vendor/moment')

export function getPublicationsNew(
  req: XP.Request,
  start = 0,
  count = 10,
  language: string,
  articleType?: string,
  subject?: string
): PublicationResult {
  const mainSubjects: Array<SubjectItem> = getMainSubjects(req, language)
  const subSubjects: Array<SubjectItem> = getSubSubjects(req, language)
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

  const query: QueryDSL = {
    range: {
      field: 'publish.from',
      type: 'dateTime',
      lte: new Date().toISOString(),
    },
  }

  const res: MultiRepoNodeQueryResponse = connection.query({
    start,
    count,
    sort: 'publish.from DESC',
    query: query as unknown as string, // hack because Node lib supports QueryDSL but the types for it is not in this version
    filters: {
      boolean: {
        must: [
          {
            hasValue: {
              field: 'language',
              values: language === 'nb' ? ['nb', 'nn'] : ['en'],
            },
          },
          {
            hasValue: {
              field: 'data.articleType',
              values: forceArray(articleType).filter(notEmptyOrUndefined),
            },
          },
        ],
        should: [
          // reports
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
              ],
            },
          },
          // articles
          {
            boolean: {
              must: [
                {
                  hasValue: {
                    field: 'type',
                    values: [`${app.name}:article`],
                  },
                },
                {
                  hasValue: {
                    field: 'x.mimir.subjects.mainSubjects',
                    values: forceArray(subject),
                  },
                },
              ],
            },
          },
        ],
      },
    },
  })

  const contents: (Content<Article, XData> | ContentLight<Release>)[] = res.hits.map((hit) =>
    connect(hit).get<Content<Article, XData> | ContentLight<Release>>(hit.id)
  )

  const publications: Array<PublicationItem> = contents.map((content) =>
    isContentArticle(content)
      ? articleAsPublicationItem({
          content,
          language,
          mainSubjects,
          subSubjects,
        })
      : statisticsAsPublicationItem({
          language,
          release: content,
          mainSubjects,
        })
  )

  return {
    total: res.total,
    publications,
  }
}

function isContentArticle(content: unknown): content is Content<Article, XData> {
  return (content as Content).type == `${app.name}:article`
}

function statisticsAsPublicationItem({
  release,
  language,
  mainSubjects,
}: StatisticsAsPublicationItemParams): PublicationItem {
  const mainSubjectsStatistic: string[] = forceArray(release.data.mainSubjects) ?? []
  const secondaryMainSubjects: string[] =
    mainSubjectsStatistic.length > 1 ? forceArray(mainSubjectsStatistic.shift()) : []
  const mainSubjectId: string = mainSubjectsStatistic.length ? mainSubjectsStatistic[0] : ''
  const mainSubjectTitle: string = mainSubjectId.length
    ? mainSubjects.filter((subject) => subject.name === mainSubjectId)[0].title
    : ''

  return {
    title: release.data.name,
    period: release.data.period,
    preface: release.data.ingress!,
    url: pageUrl({
      id: release.data.statisticContentId!,
    }),
    publishDate: moment(release.data.previousRelease).locale('nb').format('YYYY.MM.DD HH:mm'),
    publishDateHuman: formatDate(release.data.previousRelease, 'PPP', language),
    contentType: `${app.name}:statistics`,
    articleType: 'statistics',
    mainSubjectId: mainSubjectId,
    mainSubject: mainSubjectTitle,
    secondaryMainSubjects: secondaryMainSubjects,
    appName: app.name,
  }
}

function articleAsPublicationItem({
  content,
  mainSubjects,
  subSubjects,
  language,
}: ArticleAsPublicationItemParams): PublicationItem {
  const mainSubject: SubjectItem | undefined = mainSubjects.find((mainSubject) =>
    content._path.startsWith(mainSubject.path)
  )
  const subtopics: Array<string> = forceArray(content.data.subtopic)
  const secondaryMainSubjects: Array<string> = subtopics
    ? getSecondaryMainSubject(subtopics, mainSubjects, subSubjects)
    : []

  return {
    title: content.displayName,
    preface: content.data.ingress ? content.data.ingress : '',
    url: pageUrl({
      id: content._id,
    }),
    publishDate: content.publish?.from ? moment(content.publish.from).locale('nb').format('YYYY.MM.DD HH:mm') : '',
    publishDateHuman: content.publish?.from ? moment(content.publish.from).locale(language).format('Do MMMM YYYY') : '',
    contentType: content.type,
    articleType: content.data.articleType ?? 'default',
    mainSubjectId: mainSubject ? mainSubject.name : '',
    mainSubject: mainSubject ? mainSubject.title : '',
    secondaryMainSubjects,
    appName: app.name,
  }
}

//TODO: Remove when content Article have x-data with mainsubjects
function getSecondaryMainSubject(
  subtopicsContent: Array<string>,
  mainSubjects: Array<SubjectItem>,
  subSubjects: Array<SubjectItem>
): Array<string> {
  return subtopicsContent.reduce((acc: Array<string>, topic: string) => {
    const subSubject: SubjectItem = subSubjects.filter((subSubject) => subSubject.id === topic)[0]

    if (subSubject) {
      const mainSubject: SubjectItem | undefined = getMainSubjectBySubSubject(subSubject, mainSubjects)
      if (mainSubject && !acc.includes(mainSubject.name)) {
        acc.push(mainSubject.name)
      }
    }

    return acc
  }, [])
}

interface StatisticsAsPublicationItemParams {
  release: ContentLight<Release>
  language: string
  mainSubjects: SubjectItem[]
}

interface ArticleAsPublicationItemParams {
  content: Content<Article, XData>
  mainSubjects: Array<SubjectItem>
  subSubjects: Array<SubjectItem>
  language: string
}

export type PublicationArchiveLib = typeof import('./publicationArchiveNew')

export interface PublicationResult {
  total: number
  publications: Array<PublicationItem>
}

export interface PublicationItem {
  title: string
  period?: string
  preface: string
  url: string
  publishDate: string
  publishDateHuman: string | undefined
  contentType: string
  articleType: string
  mainSubjectId: string
  mainSubject: string
  secondaryMainSubjects: Array<string>
  appName: string
}
