import { getService, isStatregEnabled, type NewsItem, type StatkalItem } from '/lib/ssb/utils/serviceUtils'

function check(condition: boolean, message: string) {
  if (!condition) throw new Error(message)
}

function checkCommonFields(item: StatkalItem | NewsItem) {
  for (const field of ['guid', 'title', 'link', 'category', 'subject', 'pubDate', 'shortname'] as const) {
    check(typeof item[field] === 'string', `Invalid ${field}`)
  }
  check(['no', 'en'].includes(item.language), 'Invalid language')
  check(!isNaN(Date.parse(item.pubDate)), 'Invalid pubDate')
}

export function get() {
  try {
    // Prerequisite: new Statreg source must be enabled
    check(isStatregEnabled(), 'new-statreg-as-source is disabled')

    // rssStatkal: upcoming statistical releases
    const statkal = getService<StatkalItem[]>('rssStatkal')
    check(Array.isArray(statkal) && statkal.length > 0, 'Invalid rssStatkal response')

    for (const item of statkal) {
      checkCommonFields(item)
      check(typeof item.periode === 'string', 'Invalid periode')
      check(Array.isArray(item.contacts) && item.contacts.length === 0, 'Invalid contacts')
    }

    // rssNews: recent articles and statistical releases
    const news = getService<NewsItem[]>('rssNews', { days: 90 })
    check(Array.isArray(news) && news.length > 0, 'Invalid rssNews response')

    for (const item of news) {
      checkCommonFields(item)
      check(typeof item.description === 'string', 'Invalid description')
    }

    return {
      status: 200,
      contentType: 'application/json',
      body: {
        rssStatkal: { passed: true, items: statkal.length },
        rssNews: { passed: true, items: news.length },
      },
    }
  } catch (error) {
    return {
      status: 500,
      contentType: 'application/json',
      body: { error: String(error) },
    }
  }
}
