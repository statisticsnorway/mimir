import { Article } from '../../../site/content-types/article/article'
import { query, get, Content, QueryResponse } from '/lib/xp/content'
import { StatisticInListing } from '../dashboard/statreg/types'
import { getAllStatisticsFromRepo } from '../statreg/statistics'
import { calculatePeriodRelease, Release } from '../utils/variantUtils'
import { SubjectItem } from '../utils/subjectUtils'
import { Statistics } from '../../../site/content-types/statistics/statistics'
import { SEO } from '../../../services/news/news'
import { OmStatistikken } from '../../../site/content-types/omStatistikken/omStatistikken'
import { formatDate } from '../utils/dateUtils'

const {
  pageUrl
} = __non_webpack_require__('/lib/xp/portal')
const {
  moment
} = __non_webpack_require__('/lib/vendor/moment')
const {
  getPreviousReleases
} = __non_webpack_require__( '/lib/ssb/utils/variantUtils')
const {
  getMainSubjects, getSubSubjects, getMainSubjectBySubSubject
} = __non_webpack_require__( '/lib/ssb/utils/subjectUtils')
const {
  fromPartCache
} = __non_webpack_require__('/lib/ssb/cache/partCache')
const {
  data: {
    forceArray
  }
} = __non_webpack_require__('/lib/util')

export function getPublications(req: XP.Request, start: number = 0, count: number = 10, language: string, articleType?: string, subject?: string):
    PublicationResult {
  const allPublications: Array<PublicationItem> = fromPartCache(req, `archiveAllPublications-${language}`, () => {
    return getPublicationsAndStatistics(req, language)
  })

  const type: string| undefined = articleType && articleType !== '' ? articleType : undefined
  const mainSubject: string| undefined = subject && subject !== '' ? subject : undefined
  const filteredPublication: Array<PublicationItem> = type || mainSubject ? filterPublications(allPublications, type, mainSubject) : allPublications

  return {
    publications: filteredPublication.slice(start, start + count),
    total: filteredPublication.length
  }
}

function filterPublications(publications: Array<PublicationItem>, articleType: string| undefined, subject: string| undefined): Array<PublicationItem> {
  if (articleType && subject) {
    return publications.filter((publication) =>
      (publication.articleType === articleType && (publication.mainSubjectId === subject || publication.secondaryMainSubjects.includes(subject))))
  }
  if (articleType && !subject) {
    return publications.filter((publication) => publication.articleType === articleType)
  }
  if (!articleType && subject) {
    return publications.filter((publication) => publication.mainSubjectId === subject || publication.secondaryMainSubjects.includes(subject))
  }
  return publications
}

function getPublicationsAndStatistics(req: XP.Request, language: string):
    Array<PublicationItem> {
  const mainSubjects: Array<SubjectItem> = getMainSubjects(req, language)
  const subSubjects: Array<SubjectItem> = getSubSubjects(req, language)
  const articlesContent: QueryResponse<Article, object> = getArticlesContent(language, mainSubjects)

  const publications: Array<PublicationItem> = articlesContent.hits.map((article) => {
    return prepareArticle(article, mainSubjects, subSubjects, language)
  })

  const statistics: Array<PublicationItem> = getStatistics(language, mainSubjects, subSubjects)
  const statisticsWithMainSubject: Array<PublicationItem> = statistics.filter((statistic) => statistic.mainSubject !== '')

  const allPublications: Array<PublicationItem> = publications.concat(statisticsWithMainSubject)
  const allPublicationsSorted: Array<PublicationItem> = allPublications.sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime())

  return allPublicationsSorted
}

function prepareStatisticRelease(
  mainSubjects: Array<SubjectItem>,
  subSubjects: Array<SubjectItem>,
  release: Release, language: string
): PublicationItem | null {
  const statisticsPagesXP: Content<Statistics, SEO> | undefined = query({
    count: 1,
    query: `data.statistic LIKE "${release.statisticId}" AND language IN (${language === 'nb' ? '"nb", "nn"' : '"en"'})`,
    contentTypes: [`${app.name}:statistics`]
  }).hits[0] as unknown as Content<Statistics, SEO>

  if (statisticsPagesXP) {
    const statisticsPageUrl: string = pageUrl({
      path: statisticsPagesXP._path
    })

    const aboutTheStatisticsContent: Content<OmStatistikken> | null = statisticsPagesXP.data.aboutTheStatistics ? get({
      key: statisticsPagesXP.data.aboutTheStatistics
    }) : null
    const seoDescription: string = statisticsPagesXP.x['com-enonic-app-metafields']['meta-data'].seoDescription ?
      statisticsPagesXP.x['com-enonic-app-metafields']['meta-data'].seoDescription : ''

    const mainSubject: Array<SubjectItem> = mainSubjects.filter((subject) => statisticsPagesXP._path.startsWith(subject.path))
    const mainSubjectName: string = mainSubject.length > 0 ? mainSubject[0].title : ''
    const subtopics: Array<string> = statisticsPagesXP.data.subtopic ? forceArray(statisticsPagesXP.data.subtopic) : []
    const secondaryMainSubjects: Array<string> = subtopics ? getSecondaryMainSubject(subtopics, mainSubjects, subSubjects) : []
    const period: string = calculatePeriodRelease(release, language)

    return {
      title: language === 'en' ? release.statisticNameEn : release.statisticName,
      period: period.charAt(0).toUpperCase() + period.slice(1),
      preface: aboutTheStatisticsContent ? aboutTheStatisticsContent.data.ingress : seoDescription,
      url: statisticsPageUrl,
      publishDate: moment(release.publishTime).locale('nb').format('YYYY.MM.DD HH:mm'),
      publishDateHuman: formatDate(release.publishTime, 'PPP', language),
      contentType: `${app.name}:statistics`,
      articleType: 'statistics',
      mainSubjectId: mainSubject.length > 0 ? mainSubject[0].name : '',
      mainSubject: mainSubjectName,
      secondaryMainSubjects: secondaryMainSubjects,
      appName: app.name
    }
  }

  return null
}

function prepareArticle(article: Content<Article>, mainSubjects: Array<SubjectItem>, subSubjects: Array<SubjectItem>, language: string): PublicationItem {
  const mainSubject: SubjectItem | undefined = mainSubjects.find((mainSubject) => {
    return article._path.startsWith(mainSubject.path)
  })
  const subtopics: Array<string> = article.data.subtopic ? forceArray(article.data.subtopic) : []
  const secondaryMainSubjects: Array<string> = subtopics ? getSecondaryMainSubject(subtopics, mainSubjects, subSubjects) : []
  return {
    title: article.displayName,
    preface: article.data.ingress ? article.data.ingress : '',
    url: pageUrl({
      id: article._id
    }),
    publishDate: article.publish && article.publish.from ? moment(article.publish.from).locale('nb').format('YYYY.MM.DD HH:mm') : '',
    publishDateHuman: article.publish && article.publish.from ? moment(article.publish.from).locale(language).format('Do MMMM YYYY') : '',
    contentType: article.type,
    articleType: article.data.articleType ? article.data.articleType : 'default',
    mainSubjectId: mainSubject ? mainSubject.name : '',
    mainSubject: mainSubject ? mainSubject.title : '',
    secondaryMainSubjects: secondaryMainSubjects,
    appName: app.name
  }
}

function getArticlesContent(
  language: string,
  mainSubjects: Array<SubjectItem>
): QueryResponse<Article, object> {
  const languageQuery: string = language !== 'en' ? 'AND language != "en"' : 'AND language = "en"'
  const now: string = new Date().toISOString()
  const publishFromQuery: string = `(publish.from LIKE '*' AND publish.from < '${now}')`
  const pagePaths: Array<string> = mainSubjects.map((mainSubject) => `_parentPath LIKE "/content${mainSubject.path}/*"`)
  const subjectQuery: string = `(${pagePaths.join(' OR ')})`
  const queryString: string = `${publishFromQuery} AND ${subjectQuery} ${languageQuery}`

  const res: QueryResponse<Article, object> = query({
    count: 10000,
    query: queryString,
    contentTypes: [`${app.name}:article`],
    sort: 'publish.from DESC'
  })
  return res
}

function getStatistics(language: string, mainSubjects: Array<SubjectItem>, subSubjects: Array<SubjectItem> ): Array<PublicationItem> {
  const statistics: Array<StatisticInListing> = getAllStatisticsFromRepo()
  const previousReleases: Array<Release> = getPreviousReleases(statistics)
  const statisticsReleases: Array<PublicationItem> = previousReleases.reduce(function(acc: Array<PublicationItem>, release: Release) {
    const preppedRelease: PublicationItem | null = prepareStatisticRelease(mainSubjects, subSubjects, release, language)
    if (preppedRelease) {
      acc.push(preppedRelease)
    }
    return acc
  }, [])

  return statisticsReleases.sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime())
}

function getSecondaryMainSubject(subtopicsContent: Array<string>, mainSubjects: Array<SubjectItem>, subSubjects: Array<SubjectItem> ): Array<string> {
  const secondaryMainSubjects: Array<string> = subtopicsContent.reduce((acc: Array<string>, topic: string) => {
    const subSubject: SubjectItem = subSubjects.filter((subSubject) => subSubject.id === topic)[0]
    if (subSubject) {
      const mainSubject: SubjectItem| undefined = getMainSubjectBySubSubject(subSubject, mainSubjects)
      if (mainSubject && !acc.includes(mainSubject.name)) {
        acc.push(mainSubject.name)
      }
    }
    return acc
  }, [])
  return secondaryMainSubjects
}

export interface PublicationArchiveLib {
  getPublications: (req: XP.Request, start: number, count: number, language: string, contentType?: string, subject?: string) => PublicationResult;
}

export interface PublicationResult {
  total: number;
  publications: Array<PublicationItem>;
}

export interface PublicationItem {
  title: string;
  period?: string;
  preface: string;
  url: string;
  publishDate: string;
  publishDateHuman: string | undefined;
  contentType: string;
  articleType: string;
  mainSubjectId: string;
  mainSubject: string;
  secondaryMainSubjects: Array<string>;
  appName: string;
}
