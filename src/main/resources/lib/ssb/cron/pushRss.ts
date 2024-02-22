import { HttpRequestParams, HttpResponse, request } from '/lib/http-client'
import { getRssItemsStatkal } from '/lib/ssb/rss/statkal'
import { encryptRssNews, encryptRssStatkal } from '/lib/cipher/cipherRss'

export function pushRssNews(): string {
  const newsServiceUrl: string = app.config?.['ssb.baseUrl']
    ? app.config['ssb.baseUrl'] + '/_/service/mimir/news'
    : 'https://www.utv.ssb.no/_/service/mimir/news'
  const rssNews: RssItems = getRssNews(newsServiceUrl)
  if (rssNews.body !== null) {
    const encryptedBody: string = encryptRssNews(rssNews.body)
    return postRssNews(encryptedBody)
  } else {
    return rssNews.message
  }
}

export function pushRssStatkal(): string {
  const rssStatkal: string | null = getRssItemsStatkal()
  if (rssStatkal !== null) {
    const encryptedBody: string = encryptRssStatkal(rssStatkal)
    return postRssStatkal(encryptedBody)
  } else {
    return 'Ingen publiseringer å pushe til rss/statkal'
  }
}

function getRssNews(url: string): RssItems {
  const requestParams: HttpRequestParams = {
    url,
    method: 'GET',
    readTimeout: 40000,
  }

  const status: RssItems = {
    body: null,
    message: '',
  }

  try {
    const rssNewsResponse: HttpResponse = request(requestParams)
    if (rssNewsResponse.status === 200) {
      if (rssNewsResponse.body) {
        status.body = rssNewsResponse.body
      } else {
        status.message = 'Ingen nyheter å pushe til RSS'
      }
    } else {
      status.message = 'Henting av nyheter XP feilet - ' + rssNewsResponse.status
    }
  } catch (e) {
    status.message = 'Henting av nyheter XP feilet - ' + e
  }

  return status
}

function postRssNews(encryptedRss: string): string {
  const rssNewsBaseUrl: string =
    app.config && app.config['ssb.baseUrl']
      ? app.config['ssb.baseUrl'] + '/rss/populate/news'
      : 'https://www.utv.ssb.no/rss/populate/news'

  const requestParams: HttpRequestParams = {
    url: rssNewsBaseUrl,
    method: 'POST',
    body: encryptedRss,
  }

  try {
    const pushRssNewsResponse: HttpResponse = request(requestParams)
    if (pushRssNewsResponse.status === 200) {
      return 'Push av RSS nyheter OK'
    } else {
      return 'Push av RSS nyheter feilet - ' + pushRssNewsResponse.status
    }
  } catch (e) {
    return 'Push av nyheter feilet - ' + e
  }
}

function postRssStatkal(encryptedRss: string): string {
  const rssStatkalBaseUrl: string =
    app.config && app.config['ssb.baseUrl']
      ? app.config['ssb.baseUrl'] + '/rss/populate/statkal'
      : 'https://www.utv.ssb.no/rss/populate/statkal'

  const requestParams: HttpRequestParams = {
    url: rssStatkalBaseUrl,
    method: 'POST',
    body: encryptedRss,
  }

  try {
    const pushRssStatkalResponse: HttpResponse = request(requestParams)
    if (pushRssStatkalResponse.status === 200) {
      return 'Push av RSS statkal OK'
    } else {
      return `Push av RSS statkal til ${rssStatkalBaseUrl} feilet - ${pushRssStatkalResponse.status} `
    }
  } catch (e) {
    return 'Push av RSS statkal feilet - ' + e
  }
}

interface RssItems {
  body: string | null
  message: string
}
