import { Article } from '../../../site/content-types/article/article'
import { Content, QueryResponse } from 'enonic-types/content'
import { Page } from '../../../site/content-types/page/page'
import { StatisticInListing } from '../dashboard/statreg/types'
import { getAllStatisticsFromRepo } from '../statreg/statistics'
import { calculatePeriodRelease, Release } from '../utils/variantUtils'
import { SubjectItem } from '../utils/subjectUtils'
import { Request } from 'enonic-types/controller'
import { Statistics } from '../../../site/content-types/statistics/statistics'
import { SEO } from '../../../services/news/news'
import { OmStatistikken } from '../../../site/content-types/omStatistikken/omStatistikken'

const {
  query,
  get
} = __non_webpack_require__('/lib/xp/content')
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
  getMainSubjects
} = __non_webpack_require__( '/lib/ssb/utils/subjectUtils')
const {
  fromPartCache
} = __non_webpack_require__('/lib/ssb/cache/partCache')

export function getPublications(req: Request, start: number = 0, count: number = 10, language: string, articleType?: string, subject?: string):
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
    return publications.filter((publication) => (publication.articleType === articleType && publication.mainSubjectId === subject))
  }
  if (articleType && !subject) {
    return publications.filter((publication) => publication.articleType === articleType)
  }
  if (!articleType && subject) {
    return publications.filter((publication) => publication.mainSubjectId === subject)
  }
  return publications
}

function getPublicationsAndStatistics(req: Request, language: string):
    Array<PublicationItem> {
  const languageQuery: string = language !== 'en' ? 'AND language != "en"' : 'AND language = "en"'
  const mainSubjects: Array<Content<Page>> = query({
    count: 500,
    contentTypes: [`${app.name}:page`],
    query: `components.page.config.mimir.default.subjectType LIKE "mainSubject" ${languageQuery}`
  }).hits as unknown as Array<Content<Page>>

  const articlesContent: QueryResponse<Article> = getArticlesContent(language, mainSubjects, languageQuery)

  const publications: Array<PublicationItem> = articlesContent.hits.map((article) => {
    const mainSubject: Content<Page> | undefined = mainSubjects.find((mainSubject) => {
      return article._path.startsWith(mainSubject._path)
    })
    return prepareArticle(article, mainSubject, language)
  })

  const statistics: Array<PublicationItem> = getStatistics(req, language)
  const statisticsWithMainSubject: Array<PublicationItem> = statistics.filter((statistic) => statistic.mainSubject !== '')

  const allPublications: Array<PublicationItem> = publications.concat(statisticsWithMainSubject)
  const allPublicationsSorted: Array<PublicationItem> = allPublications.sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime())

  return allPublicationsSorted
}

function prepareStatisticRelease(mainSubjects: Array<SubjectItem>, release: Release, language: string): PublicationItem | null {
  const statisticsPagesXP: Content<Statistics, object, SEO> | undefined = query({
    count: 1,
    query: `data.statistic LIKE "${release.statisticId}" AND language IN (${language === 'nb' ? '"nb", "nn"' : '"en"'})`,
    contentTypes: [`${app.name}:statistics`]
  }).hits[0] as unknown as Content<Statistics, object, SEO>

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
    const period: string = calculatePeriodRelease(release, language)

    return {
      title: language === 'en' ? release.statisticNameEn : release.statisticName,
      period: period.charAt(0).toUpperCase() + period.slice(1),
      preface: aboutTheStatisticsContent ? aboutTheStatisticsContent.data.ingress : seoDescription,
      url: statisticsPageUrl,
      publishDate: release.publishTime,
      publishDateHuman: moment(new Date(release.publishTime)).locale(language).format('Do MMMM YYYY'),
      contentType: `${app.name}:statistics`,
      articleType: 'statistics',
      mainSubjectId: mainSubject.length > 0 ? mainSubject[0].name : '',
      mainSubject: mainSubjectName,
      appName: app.name
    }
  }

  return null
}

function prepareArticle(article: Content<Article>, mainSubject: Content<Page> | undefined, language: string): PublicationItem {
  return {
    title: article.displayName,
    preface: article.data.ingress ? article.data.ingress : '',
    url: pageUrl({
      id: article._id
    }),
    publishDate: article.publish && article.publish.from ? article.publish.from : '',
    publishDateHuman: article.publish && article.publish.from ? moment(article.publish.from).locale(language).format('Do MMMM YYYY') : '',
    contentType: article.type,
    articleType: article.data.articleType ? article.data.articleType : 'default',
    mainSubjectId: mainSubject ? mainSubject._name : '',
    mainSubject: mainSubject ? mainSubject.displayName : '',
    appName: app.name
  }
}

function getArticlesContent(
  language: string,
  mainSubjects: Array<Content<Page>>,
  languageQuery: string,
  articleType?: string,
  subject?: string): QueryResponse<Article> {
  const now: string = new Date().toISOString()
  const publishFromQuery: string = `(publish.from LIKE '*' AND publish.from < '${now}')`
  const pagePaths: Array<string> = mainSubjects.map((mainSubject) => `_parentPath LIKE "/content${mainSubject._path}/*"`)
  const subjectQuery: string = subject ? `_parentPath LIKE "/content/ssb/${subject}/*"` : `(${pagePaths.join(' OR ')})`
  const queryString: string = `${publishFromQuery} AND ${subjectQuery} ${languageQuery}`

  const res: QueryResponse<Article> = query({
    count: 10000,
    query: queryString,
    contentTypes: [`${app.name}:article`],
    sort: 'publish.from DESC'
  })
  return res
}

function getStatistics(req: Request, language: string, articleType?: string, subject?: string): Array<PublicationItem> {
  const mainSubjects: Array<SubjectItem> = getMainSubjects(req, language)
  const mainSubjectTitle: SubjectItem| null = subject && subject !== '' ? mainSubjects.filter((mainSubject) => mainSubject.name === subject)[0] : null
  const statistics: Array<StatisticInListing> = getAllStatisticsFromRepo()
  const previousReleases: Array<Release> = getPreviousReleases(statistics)
  const statisticsReleases: Array<PublicationItem> = previousReleases.reduce(function(acc: Array<PublicationItem>, release: Release) {
    const preppedRelease: PublicationItem | null = prepareStatisticRelease(mainSubjects, release, language)
    if (preppedRelease) {
      acc.push(preppedRelease)
    }
    return acc
  }, [])

  const filteredStatistics: Array<PublicationItem> = mainSubjectTitle ? statisticsReleases.filter((statistic) =>
    statistic.mainSubject === mainSubjectTitle.title) : statisticsReleases

  return filteredStatistics.sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime())
}

export interface PublicationArchiveLib {
  getPublications: (req: Request, start: number, count: number, language: string, contentType?: string, subject?: string) => PublicationResult;
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
  publishDateHuman: string;
  contentType: string;
  articleType: string;
  mainSubjectId: string;
  mainSubject: string;
  appName: string;
}
