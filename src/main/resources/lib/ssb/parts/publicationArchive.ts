import type { Article, OmStatistikken, Statistics } from '/site/content-types'
import { type Content, get, query, QueryDsl, ContentsResult } from '/lib/xp/content'
import type { StatisticInListing } from '/lib/ssb/dashboard/statreg/types'
import { getAllStatisticsFromRepo } from '/lib/ssb/statreg/statistics'
import { calculatePeriodRelease, type Release } from '/lib/ssb/utils/variantUtils'
import type { SubjectItem } from '/lib/ssb/utils/subjectUtils'
import { formatDate, stringToServerTime } from '/lib/ssb/utils/dateUtils'
import type { ContentLight, Release as ReleaseVariant } from '/lib/ssb/repo/statisticVariant'
import { getStatisticVariantsFromRepo } from '/lib/ssb/repo/statisticVariant'

const { pageUrl } = __non_webpack_require__('/lib/xp/portal')
const { getPreviousReleases } = __non_webpack_require__('/lib/ssb/utils/variantUtils')
const { getMainSubjects, getSubSubjects, getMainSubjectBySubSubject } =
  __non_webpack_require__('/lib/ssb/utils/subjectUtils')
const { fromPartCache } = __non_webpack_require__('/lib/ssb/cache/partCache')
const { isEnabled } = __non_webpack_require__('/lib/featureToggle')
const {
  data: { forceArray },
} = __non_webpack_require__('/lib/util')

export function getPublications(
  req: XP.Request,
  start = 0,
  count = 10,
  language: string,
  articleType?: string,
  subject?: string
): PublicationResult {
  const allPublications: Array<PublicationItem> = fromPartCache(req, `archiveAllPublications-${language}`, () => {
    return getPublicationsAndStatistics(req, language)
  })

  const type: string | undefined = articleType && articleType !== '' ? articleType : undefined
  const mainSubject: string | undefined = subject && subject !== '' ? subject : undefined
  const filteredPublication: Array<PublicationItem> =
    type || mainSubject ? filterPublications(allPublications, type, mainSubject) : allPublications

  return {
    publications: filteredPublication.slice(start, start + count),
    total: filteredPublication.length,
  }
}

function filterPublications(
  publications: Array<PublicationItem>,
  articleType: string | undefined,
  subject: string | undefined
): Array<PublicationItem> {
  if (articleType && subject) {
    return publications.filter(
      (publication) =>
        publication.articleType === articleType &&
        (publication.mainSubjectId === subject || publication.secondaryMainSubjects.includes(subject))
    )
  }
  if (articleType && !subject) {
    return publications.filter((publication) => publication.articleType === articleType)
  }
  if (!articleType && subject) {
    return publications.filter(
      (publication) => publication.mainSubjectId === subject || publication.secondaryMainSubjects.includes(subject)
    )
  }
  return publications
}

function getPublicationsAndStatistics(req: XP.Request, language: string): Array<PublicationItem> {
  const mainSubjects: Array<SubjectItem> = getMainSubjects(req, language)
  const subSubjects: Array<SubjectItem> = getSubSubjects(req, language)

  const articlesContent: ContentsResult<Content<Article>> = getArticlesContent(language, mainSubjects)

  const publications: Array<PublicationItem> = articlesContent.hits.map((article) => {
    return prepareArticle(article, mainSubjects, subSubjects, language)
  })

  const newPublicationArchiveEnabled: boolean = isEnabled('new-publication-archive', false, 'ssb')

  const statistics: Array<PublicationItem> = newPublicationArchiveEnabled
    ? getStatisticsRepo(language, mainSubjects)
    : getStatistics(language, mainSubjects, subSubjects)

  const statisticsWithMainSubject: Array<PublicationItem> = statistics.filter(
    (statistic) => statistic.mainSubject !== ''
  )

  const allPublications: Array<PublicationItem> = publications.concat(statisticsWithMainSubject)
  const allPublicationsSorted: Array<PublicationItem> = allPublications.sort(
    (a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
  )

  return allPublicationsSorted
}

function prepareStatisticRelease(
  mainSubjects: Array<SubjectItem>,
  subSubjects: Array<SubjectItem>,
  release: Release,
  language: string
): PublicationItem | null {
  const statisticsPagesXP: Content<Statistics> | undefined = query({
    count: 1,
    query: `data.statistic LIKE "${release.statisticId}" AND language IN (${
      language === 'nb' ? '"nb", "nn"' : '"en"'
    })`,
    contentTypes: [`${app.name}:statistics`],
  }).hits[0] as unknown as Content<Statistics>

  if (statisticsPagesXP) {
    const statisticsPageUrl: string = pageUrl({
      path: statisticsPagesXP._path,
    })

    const aboutTheStatisticsContent: Content<OmStatistikken> | null = statisticsPagesXP.data.aboutTheStatistics
      ? get({
          key: statisticsPagesXP.data.aboutTheStatistics,
        })
      : null
    const seoDescription = statisticsPagesXP.x['com-enonic-app-metafields']?.['meta-data']?.seoDescription
      ? statisticsPagesXP.x['com-enonic-app-metafields']['meta-data'].seoDescription
      : ''

    const mainSubject: Array<SubjectItem> = mainSubjects.filter((subject) =>
      statisticsPagesXP._path.startsWith(subject.path)
    )
    const mainSubjectName: string = mainSubject.length > 0 ? mainSubject[0].title : ''
    const subtopics: Array<string> = statisticsPagesXP.data.subtopic ? forceArray(statisticsPagesXP.data.subtopic) : []
    const secondaryMainSubjects: Array<string> = subtopics
      ? getSecondaryMainSubject(subtopics, mainSubjects, subSubjects)
      : []
    const period: string = calculatePeriodRelease(release, language)
    const publishDate: string | undefined = formatDate(release.publishTime, 'yyyy.MM.dd HH:mm', 'nb')

    return {
      title: language === 'en' ? release.statisticNameEn : release.statisticName,
      period: period.charAt(0).toUpperCase() + period.slice(1),
      preface: aboutTheStatisticsContent ? aboutTheStatisticsContent.data.ingress : seoDescription,
      url: statisticsPageUrl,
      publishDate: publishDate ?? '',
      publishDateHuman: formatDate(release.publishTime, 'PPP', language),
      contentType: `${app.name}:statistics`,
      articleType: 'statistics',
      mainSubjectId: mainSubject.length > 0 ? mainSubject[0].name : '',
      mainSubject: mainSubjectName,
      secondaryMainSubjects: secondaryMainSubjects,
      appName: app.name,
    }
  }

  return null
}

function prepareArticle(
  article: Content<Article>,
  mainSubjects: Array<SubjectItem>,
  subSubjects: Array<SubjectItem>,
  language: string
): PublicationItem {
  const mainSubject: SubjectItem | undefined = mainSubjects.find((mainSubject) => {
    return article._path.startsWith(mainSubject.path)
  })
  const subtopics: Array<string> = article.data.subtopic ? forceArray(article.data.subtopic) : []
  const secondaryMainSubjects: Array<string> = subtopics
    ? getSecondaryMainSubject(subtopics, mainSubjects, subSubjects)
    : []
  const publishDate: string | undefined =
    article.publish && article.publish.from ? formatDate(article.publish.from, 'yyyy.MM.dd HH:mm', 'nb') : undefined
  return {
    title: article.displayName,
    preface: article.data.ingress ? article.data.ingress : '',
    url: pageUrl({
      id: article._id,
    }),
    publishDate: publishDate ?? '',
    publishDateHuman: article.publish && article.publish.from ? formatDate(article.publish.from, 'PPP', language) : '',
    contentType: article.type,
    articleType: article.data.articleType ? article.data.articleType : 'default',
    mainSubjectId: mainSubject ? mainSubject.name : '',
    mainSubject: mainSubject ? mainSubject.title : '',
    secondaryMainSubjects: secondaryMainSubjects,
    appName: app.name,
  }
}

function getArticlesContent(language: string, mainSubjects: Array<SubjectItem>) {
  const languageQuery: string = language !== 'en' ? 'AND language != "en"' : 'AND language = "en"'
  const now: string = new Date().toISOString()
  const publishFromQuery = `(publish.from LIKE '*' AND publish.from < '${now}')`
  const pagePaths: Array<string> = mainSubjects.map((mainSubject) => `_parentPath LIKE "/content${mainSubject.path}/*"`)
  const subjectQuery = `(${pagePaths.join(' OR ')})`
  const queryString = `${publishFromQuery} AND ${subjectQuery} ${languageQuery}`

  const res: ContentsResult<Content<Article>> = query({
    count: 10000,
    query: queryString,
    contentTypes: [`${app.name}:article`],
    sort: 'publish.from DESC',
  })
  return res
}

function getStatisticsRepo(language: string, mainSubjects: Array<SubjectItem>): Array<PublicationItem> {
  const query: QueryDsl = {
    range: {
      field: 'publish.from',
      type: 'dateTime',
      lte: new Date().toISOString(),
    },
  }

  const allPreviousStatisticVariantsFromRepo: ContentLight<ReleaseVariant>[] = getStatisticVariantsFromRepo(
    language,
    query
  )
  const previousReleases: PublicationItem[] = allPreviousStatisticVariantsFromRepo.map((release) => {
    const mainSubjectsStatistic: string[] = release.data.mainSubjects ? forceArray(release.data.mainSubjects) : []
    const secondaryMainSubjects: string[] =
      mainSubjectsStatistic.length > 1 ? mainSubjectsStatistic.slice(1, mainSubjectsStatistic.length) : []
    const mainSubjectId: string = mainSubjectsStatistic.length ? mainSubjectsStatistic[0] : ''
    const mainSubjectTitle: string = mainSubjectId.length
      ? mainSubjects.filter((subject) => subject.name === mainSubjectId)[0].title
      : ''

    const nextReleasePassed: boolean = new Date(release.data.nextRelease) <= stringToServerTime()
    const period = nextReleasePassed ? release.data.nextPeriod : release.data.previousPeriod
    const publishDate = nextReleasePassed ? release.data.nextRelease : release.data.previousRelease

    return {
      title: release.data.name,
      period,
      preface: release.data.ingress ?? '',
      url: release.data.statisticContentId
        ? pageUrl({
            id: release.data.statisticContentId,
          })
        : '',
      publishDate: formatDate(publishDate, 'yyyy.MM.dd HH:mm', language) ?? '',
      publishDateHuman: formatDate(publishDate, 'PPP', language),
      contentType: `${app.name}:statistics`,
      articleType: 'statistics',
      mainSubjectId: mainSubjectId,
      mainSubject: mainSubjectTitle,
      secondaryMainSubjects: secondaryMainSubjects,
      appName: app.name,
    }
  })

  return previousReleases
}

function getStatistics(
  language: string,
  mainSubjects: Array<SubjectItem>,
  subSubjects: Array<SubjectItem>
): Array<PublicationItem> {
  const statistics: Array<StatisticInListing> = getAllStatisticsFromRepo()
  const previousReleases: Array<Release> = getPreviousReleases(statistics)
  const statisticsReleases: Array<PublicationItem> = previousReleases.reduce(function (
    acc: Array<PublicationItem>,
    release: Release
  ) {
    const preppedRelease: PublicationItem | null = prepareStatisticRelease(mainSubjects, subSubjects, release, language)
    if (preppedRelease) {
      acc.push(preppedRelease)
    }
    return acc
  },
  [])

  return statisticsReleases.sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime())
}

function getSecondaryMainSubject(
  subtopicsContent: Array<string>,
  mainSubjects: Array<SubjectItem>,
  subSubjects: Array<SubjectItem>
): Array<string> {
  const secondaryMainSubjects: Array<string> = subtopicsContent.reduce((acc: Array<string>, topic: string) => {
    const subSubject: SubjectItem = subSubjects.filter((subSubject) => subSubject.id === topic)[0]
    if (subSubject) {
      const mainSubject: SubjectItem | undefined = getMainSubjectBySubSubject(subSubject, mainSubjects)
      if (mainSubject && !acc.includes(mainSubject.name)) {
        acc.push(mainSubject.name)
      }
    }
    return acc
  }, [])
  return secondaryMainSubjects
}

export interface PublicationArchiveLib {
  getPublications: (
    req: XP.Request,
    start: number,
    count: number,
    language: string,
    contentType?: string,
    subject?: string
  ) => PublicationResult
}

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
