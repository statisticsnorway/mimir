import { query, Content } from '/lib/xp/content'
import { pageUrl } from '/lib/xp/portal'
import { StatisticInListing, VariantInListing } from '/lib/ssb/dashboard/statreg/types'
import { getTimeZoneIso } from '/lib/ssb/utils/dateUtils'
import { subDays, isSameDay, format, parseISO } from '/lib/vendor/dateFns'
import { fetchStatisticsWithReleaseToday } from '/lib/ssb/statreg/statistics'
import { isEnabled } from '/lib/featureToggle'
import { xmlEscape } from '/lib/text-encoding'
import { type Statistic } from '/site/mixins/statistic'
import { type Default as DefaultPageConfig } from '/site/pages/default'
import { type Page, type Article, type Statistics } from '/site/content-types'

function get(): XP.Response {
  const rssNewsEnabled: boolean = isEnabled('rss-news', true, 'ssb')
  const rssStatisticsEnabled: boolean = isEnabled('rss-news-statistics', false, 'ssb')
  const mainSubjects: Array<Content<Page & DefaultPageConfig>> = rssNewsEnabled
    ? (query({
        start: 0,
        count: 100,
        query: 'components.page.config.mimir.default.subjectType LIKE "mainSubject"',
      }).hits as unknown as Array<Content<Page & DefaultPageConfig>>)
    : []

  const news: Array<News> = rssNewsEnabled ? getNews(mainSubjects) : []
  const statistics: Array<News> = rssNewsEnabled && rssStatisticsEnabled ? getStatisticsNews(mainSubjects) : []
  const xml = `<?xml version="1.0" encoding="utf-8"?>
  <rssitems count="${news.length + statistics.length}">
    ${[...news, ...statistics]
      .map(
        (n: News) => `<rssitem>
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
  return {
    body: xml,
    contentType: 'text/xml',
  }
}
exports.get = get

function getNews(mainSubjects: Array<Content<Page & DefaultPageConfig>>): Array<News> {
  const from: string = subDays(new Date(), 1).toISOString()
  const to: string = new Date().toISOString()
  const baseUrl: string = app.config?.['ssb.baseUrl'] || ''
  const serverOffsetInMilliSeconds: number = parseInt(app.config?.['serverOffsetInMs']) || 0
  const timeZoneIso: string = getTimeZoneIso(serverOffsetInMilliSeconds)

  const news: Array<News> = []
  mainSubjects.forEach((mainSubject) => {
    const articles: Array<Content<Article>> = query({
      start: 0,
      count: 1000,
      contentTypes: [`${app.name}:article`],
      query: `_path LIKE "/content${mainSubject._path}/*" AND range("publish.from", instant("${from}"), instant("${to}"))`,
      filters: {
        boolean: {
          mustNot: {
            hasValue: {
              field: 'data.frontPagePriority',
              values: ['hideArticleInRSS'],
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
        news.push({
          guid: article._id,
          title: article.displayName,
          link:
            baseUrl +
            pageUrl({
              id: article._id,
            }),
          description:
            article.data.ingress || article.x['com-enonic-app-metafields']?.['meta-data']?.seoDescription || '',
          category: mainSubject.displayName,
          subject: mainSubject._name,
          language: article.language === 'en' ? 'en' : 'no',
          pubDate: pubDate,
          shortname: '',
        })
      }
    })
  })

  return news
}

function getStatisticsNews(mainSubjects: Array<Content<Page & DefaultPageConfig>>): Array<News> {
  const statregStatistics: Array<StatisticInListing> = fetchStatisticsWithReleaseToday()

  const statisticsNews: Array<News> = []
  if (statregStatistics.length > 0) {
    mainSubjects.forEach((mainSubject) => {
      const statistics: Array<Content<Statistics & Statistic>> = query({
        start: 0,
        count: 100,
        query: `_path LIKE "/content${mainSubject._path}/*" AND data.statistic IN(${statregStatistics
          .map((s) => `"${s.id}"`)
          .join(',')})`,
      }).hits as unknown as Array<Content<Statistics & Statistic>>

      const baseUrl: string = app.config?.['ssb.baseUrl'] || ''
      const serverOffsetInMS: number = parseInt(app.config?.['serverOffsetInMs']) || 0
      const timeZoneIso: string = getTimeZoneIso(serverOffsetInMS)
      statistics.forEach((statistic) => {
        const statreg: StatisticInListing | undefined = statregStatistics.find(
          (s) => s.id.toString() === statistic.data.statistic
        )
        const variant: VariantInListing | undefined = statreg?.variants?.[0] || undefined
        let pubDate: string | undefined
        if (variant) {
          const previousReleaseSameDayNow: boolean = variant.previousRelease
            ? isSameDay(new Date(variant.previousRelease), new Date())
            : false
          const nextReleaseSameDayNow: boolean = variant.nextRelease
            ? isSameDay(new Date(variant.nextRelease), new Date())
            : false
          if (previousReleaseSameDayNow) {
            pubDate = variant.previousRelease ? formatPubDateStatistic(variant.previousRelease, timeZoneIso) : undefined
          } else if (nextReleaseSameDayNow) {
            pubDate = variant.nextRelease ? formatPubDateStatistic(variant.nextRelease, timeZoneIso) : undefined
          }
        }
        if (pubDate) {
          statisticsNews.push({
            guid: statistic._id,
            title: statistic.displayName, // displayName, frequency
            link:
              baseUrl +
              pageUrl({
                id: statistic._id,
              }),
            description: statistic.x['com-enonic-app-metafields']?.['meta-data']?.seoDescription || '',
            category: mainSubject.displayName,
            subject: mainSubject._name,
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

function formatPubDateArticle(date: string, serverOffsetInMS: number, timeZoneIso: string): string {
  const dateWithOffset = new Date(new Date(date).getTime() + serverOffsetInMS)
  const pubDate: string = format(dateWithOffset, "yyyy-MM-dd'T'HH:mm:ss")
  return `${pubDate}${timeZoneIso}`
}

function formatPubDateStatistic(date: string, timeZoneIso: string): string {
  const pubDate: string = format(parseISO(date), "yyyy-MM-dd'T'HH:mm:ss")
  return `${pubDate}${timeZoneIso}`
}

/*
function testPubDates() {
  const serverOffsetInMS: number = parseInt(app.config?.['serverOffsetInMs']) || 0
  const timeZoneIso: string = getTimeZoneIso(serverOffsetInMS)

  const ArtikkelDate = formatPubDateArticle('2023-03-20T07:00:00Z', serverOffsetInMS, timeZoneIso)
  const StatistikkDate = formatPubDateStatistic('2023-03-20 08:00:00.0', timeZoneIso)

  log.info(`RSS-news - Artikkel: ${ArtikkelDate} statistikk: ${StatistikkDate}`)
} */

interface News {
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
