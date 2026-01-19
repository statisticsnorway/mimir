import { type Request } from '@enonic-types/core'
import { query, type Content } from '/lib/xp/content'
import { StatisticInListing, VariantInListing } from '/lib/ssb/dashboard/statreg/types'
import { getTimeZoneIso } from '/lib/ssb/utils/dateUtils'
import { subDays, isAfter } from '/lib/vendor/dateFns'
import { getServerOffsetInMs } from '/lib/ssb/utils/serverOffset'
import { getAllStatisticsFromRepo } from '/lib/ssb/statreg/statistics'
import { getMainSubjects } from '/lib/ssb/utils/subjectUtils'
import { getIngressWithKeyFigureText } from '/lib/ssb/utils/keyFigureTextUtils'
import { type SubjectItem } from '/lib/types/subject'
import { type Statistic } from '/site/mixins/statistic'
import { type Article, type Statistics } from '/site/content-types'
import { ensureArray } from '../utils/arrayUtils'
import { findLatestRelease, formatPubDateArticle, getLinkByPath, getPubDateStatistic } from './news-helpers'

const dummyReq: Partial<Request> = {
  branch: 'master',
}

export function getNews(days: number): NewsItem[] {
  const mainSubjects: SubjectItem[] = getMainSubjects(dummyReq as Request)
  const articles: NewsItem[] = getArticles(mainSubjects, days)
  const statistics: NewsItem[] = getStatistics(mainSubjects, days)
  return articles.concat(statistics)
}

function getArticles(mainSubjects: SubjectItem[], days: number): NewsItem[] {
  const from: string = subDays(new Date(), days).toISOString()
  const to: string = new Date().toISOString()
  const serverOffsetInMs: number = getServerOffsetInMs()
  const timeZoneIso: string = getTimeZoneIso(serverOffsetInMs)

  const news: Array<NewsItem> = []
  mainSubjects.forEach((mainSubject) => {
    const articles: Array<Content<Article>> = query({
      start: 0,
      count: 1000,
      contentTypes: [`${app.name}:article`],
      query: `_path LIKE "/content${mainSubject.path}/*" AND range("publish.from", instant("${from}"), instant("${to}"))`,
      filters: {
        boolean: {
          mustNot: {
            hasValue: {
              field: 'data.hideArticleInRSS',
              values: [true],
            },
          },
        },
      },
    }).hits as unknown as Array<Content<Article>>
    articles.forEach((article) => {
      const pubDate: string | undefined = article.publish?.from
        ? formatPubDateArticle(article.publish.from, serverOffsetInMs, timeZoneIso)
        : undefined
      if (pubDate) {
        const link = getLinkByPath(article._path)
        const preface = getIngressWithKeyFigureText(article.data.ingress)
        news.push({
          guid: article._id,
          title: article.displayName,
          link,
          description: article?.x['com-enonic-app-metafields']?.['meta-data']?.seoDescription || preface || '',
          category: mainSubject.title,
          subject: mainSubject.name,
          language: article.language === 'en' ? 'en' : 'no',
          pubDate: pubDate,
          shortname: '',
        })
      }
    })
  })

  return news
}

function getStatistics(mainSubjects: SubjectItem[], days: number): NewsItem[] {
  const from = new Date(subDays(new Date(), days).setHours(0, 0, 0, 0))
  const statistics: Array<StatisticInListing> = getAllStatisticsFromRepo()
  const serverOffsetInMs: number = getServerOffsetInMs()
  const statregStatistics = statistics.reduce((statsWithRelease: Array<StatisticInListing>, stat) => {
    const { latestVariant, latestRelease } = findLatestRelease(
      ensureArray<VariantInListing>(stat.variants),
      serverOffsetInMs
    )
    if (isAfter(latestRelease, from)) {
      stat.variants = [latestVariant]
      statsWithRelease.push(stat)
    }
    return statsWithRelease
  }, [])
  const timeZoneIso: string = getTimeZoneIso(serverOffsetInMs)

  const statisticsNews: NewsItem[] = []
  if (statregStatistics.length > 0) {
    mainSubjects.forEach((mainSubject) => {
      const statistics: Array<Content<Statistics & Statistic>> = query({
        start: 0,
        count: 100,
        query: `_path LIKE "/content${mainSubject.path}/*" AND data.statistic IN(${statregStatistics
          .map((s) => `"${s.id}"`)
          .join(',')})`,
      }).hits as unknown as Array<Content<Statistics & Statistic>>
      statistics.forEach((statistic) => {
        const statreg: StatisticInListing | undefined = statregStatistics.find(
          (s) => s.id.toString() === statistic.data.statistic
        )
        const variant: VariantInListing | undefined = statreg?.variants?.[0] || undefined
        const pubDate: string | undefined = variant
          ? getPubDateStatistic(variant, timeZoneIso, serverOffsetInMs)
          : undefined

        const link = getLinkByPath(statistic._path)

        if (pubDate) {
          statisticsNews.push({
            guid: statistic._id,
            title: statistic.displayName, // displayName, frequency
            link,
            description: statistic.x['com-enonic-app-metafields']?.['meta-data']?.seoDescription || '',
            category: mainSubject.title,
            subject: mainSubject.name,
            language: statistic.language === 'en' ? 'en' : 'no',
            pubDate: pubDate,
            shortname: statreg ? statreg.shortName : '',
          })
        }
      })
    })
  }

  return statisticsNews
}

interface NewsItem {
  guid: string // _id
  title: string // displayName
  link: string // url
  description: string // ingress
  category: string // parent displayName
  subject: string // parent _name
  language: string // language
  pubDate: string // firstPublished
  shortname: string // statreg shortname
}
