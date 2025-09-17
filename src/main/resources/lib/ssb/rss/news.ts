import { query, type Content } from '/lib/xp/content'
import { StatisticInListing, VariantInListing } from '/lib/ssb/dashboard/statreg/types'
import { getTimeZoneIso } from '/lib/ssb/utils/dateUtils'
import { subDays, format, parseISO } from '/lib/vendor/dateFns'
import { fetchStatisticsWithReleaseToday, fetchStatisticsDaysBack } from '/lib/ssb/statreg/statistics'
import { getMainSubjects } from '/lib/ssb/utils/subjectUtils'
import { nextReleasedPassed } from '/lib/ssb/utils/variantUtils'
import { getIngressWithKeyFigureText } from '/lib/ssb/utils/keyFigureTextUtils'
import { type SubjectItem } from '/lib/types/subject'
import { type Statistic } from '/site/mixins/statistic'
import { type Article, type Statistics } from '/site/content-types'

const dummyReq: Partial<XP.Request> = {
  branch: 'master',
}

export function getNews(days: number = 1): NewsItem[] {
  const mainSubjects: SubjectItem[] = getMainSubjects(dummyReq as XP.Request)
  const articles: NewsItem[] = getArticles(mainSubjects, days)
  const statistics: NewsItem[] = getStatistics(mainSubjects, days)
  return articles.concat(statistics)
}

function getArticles(mainSubjects: SubjectItem[], days: number): NewsItem[] {
  const from: string = subDays(new Date(), days).toISOString()
  const to: string = new Date().toISOString()
  const serverOffsetInMilliSeconds: number = parseInt(app.config?.['serverOffsetInMs']) || 0
  const timeZoneIso: string = getTimeZoneIso(serverOffsetInMilliSeconds)

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
        ? formatPubDateArticle(article.publish.from, serverOffsetInMilliSeconds, timeZoneIso)
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
  const statregStatistics: Array<StatisticInListing> =
    days > 1 ? fetchStatisticsDaysBack(days) : fetchStatisticsWithReleaseToday()
  const serverOffsetInMS: number = parseInt(app.config?.['serverOffsetInMs']) || 0
  const timeZoneIso: string = getTimeZoneIso(serverOffsetInMS)

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
        const pubDate: string | undefined = variant ? getPubDateStatistic(variant, timeZoneIso) : undefined

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

function getPubDateStatistic(variant: VariantInListing, timeZoneIso: string): string | undefined {
  const nextReleaseDatePassed: boolean = variant.nextRelease ? nextReleasedPassed(variant) : false
  const pubDate: string | undefined = nextReleaseDatePassed ? variant.nextRelease : variant.previousRelease
  return pubDate ? formatPubDateStatistic(pubDate, timeZoneIso) : undefined
}

function formatPubDateArticle(date: string, serverOffsetInMS: number, timeZoneIso: string): string {
  const dateWithOffset = new Date(new Date(date).getTime() + serverOffsetInMS)
  const pubDate: string = format(dateWithOffset, "yyyy-MM-dd'T'HH:mm:ss")
  return `${pubDate}${timeZoneIso}`
}

function formatPubDateStatistic(date: string, timeZoneIso: string): string {
  const pubDate: string = format(parseISO(date), "yyyy-MM-dd'T'HH:mm:ss")
  return `${pubDate}${timeZoneIso}`
}

function getLinkByPath(path: string) {
  const baseUrl: string = app.config?.['ssb.baseUrl'] || 'https://www.ssb.no'
  const site = '/ssb'
  return baseUrl + path.substring(site.length)
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
