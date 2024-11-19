import { query, type Content } from '/lib/xp/content'
import { StatisticInListing, VariantInListing } from '/lib/ssb/dashboard/statreg/types'
import { getTimeZoneIso } from '/lib/ssb/utils/dateUtils'
import { subDays, isSameDay, format, parseISO } from '/lib/vendor/dateFns'
import { fetchStatisticsWithReleaseToday } from '/lib/ssb/statreg/statistics'
import { getMainSubjects } from '/lib/ssb/utils/subjectUtils'
// @ts-ignore
import { xmlEscape } from '/lib/text-encoding'
import { type SubjectItem } from '/lib/types/subject'
import { type Statistic } from '/site/mixins/statistic'
import { type Article, type Statistics } from '/site/content-types'

const dummyReq: Partial<XP.Request> = {
  branch: 'master',
}

export function getRssItemsNews(): string | null {
  const mainSubjects: SubjectItem[] = getMainSubjects(dummyReq as XP.Request)
  const articles: NewsItem[] = getArticles(mainSubjects)
  const statistics: NewsItem[] = getStatistics(mainSubjects)
  const news: NewsItem[] = articles.concat(statistics)
  const xml = `<?xml version="1.0" encoding="utf-8"?>
    <rssitems count="${news.length}">
      ${news
        .map(
          (n: NewsItem) => `<rssitem>
        <guid isPermalink="false">${n.guid}</guid>
        <title>${xmlEscape(n.title)}</title>
        <link>${n.link}</link>
        <description>${xmlEscape(n.description)}</description>
        <category>${xmlEscape(n.category)}</category>
        <subject>${n.subject}</subject>
        <language>${n.language}</language>
        <pubDate>${n.pubDate}</pubDate>
        <shortname>${n.shortname}</shortname>
      </rssitem>`
        )
        .join('')}
    </rssitems>`
  return xml
}

export function getNews(): News {
  const mainSubjects: SubjectItem[] = getMainSubjects(dummyReq as XP.Request)
  const articles: NewsItem[] = getArticles(mainSubjects)
  const statistics: NewsItem[] = getStatistics(mainSubjects)
  return {
    news: articles.concat(statistics),
  }
}

function getArticles(mainSubjects: SubjectItem[]): NewsItem[] {
  const from: string = subDays(new Date(), 1).toISOString()
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
        news.push({
          guid: article._id,
          title: article.displayName,
          link,
          description:
            article.data.ingress || article.x['com-enonic-app-metafields']?.['meta-data']?.seoDescription || '',
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

function getStatistics(mainSubjects: SubjectItem[]): NewsItem[] {
  const statregStatistics: Array<StatisticInListing> = fetchStatisticsWithReleaseToday()
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
  const previousReleaseSameDayNow: boolean = variant.previousRelease
    ? isSameDay(new Date(variant.previousRelease), new Date())
    : false
  const nextReleaseSameDayNow: boolean = variant.nextRelease
    ? isSameDay(new Date(variant.nextRelease), new Date())
    : false
  if (previousReleaseSameDayNow) {
    return variant.previousRelease ? formatPubDateStatistic(variant.previousRelease, timeZoneIso) : undefined
  } else if (nextReleaseSameDayNow) {
    return variant.nextRelease ? formatPubDateStatistic(variant.nextRelease, timeZoneIso) : undefined
  }
  return undefined
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

interface News {
  news: NewsItem[]
}
