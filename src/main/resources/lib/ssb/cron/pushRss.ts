import { HttpRequestParams, HttpResponse, request } from '/lib/http-client'
import { getRssItemsStatkal } from '/lib/ssb/rss/statkal'
import { encryptRssNews, encryptRssStatkal } from '/lib/cipher/cipherRss'
import { Events } from '/lib/ssb/repo/query'

export function pushRssNews(): object {
  const newsServiceUrl: string = app.config?.['ssb.baseUrl']
    ? app.config['ssb.baseUrl'] + '/_/service/mimir/news'
    : 'https://www.utv.ssb.no/_/service/mimir/news'
  const rssNews: RssItems = getRssNews(newsServiceUrl)
  if (rssNews.body !== null) {
    const encryptedBody: string = encryptRssNews(rssNews.body)
    return postRssNews(encryptedBody)
  } else {
    return { message: rssNews.message }
  }
}

export function pushRssStatkal(): object {
  const rssStatkal: string | null = getRssItemsStatkal()
  if (rssStatkal !== null) {
    const encryptedBody: string = encryptRssStatkal(rssStatkal)
    return postRssStatkal(encryptedBody)
  } else {
    return { message: 'Ingen publiseringer å pushe til rss/statkal' }
  }
}

function getRssNews(url: string): RssItems {
  const requestParams: HttpRequestParams = {
    url,
    method: 'GET',
    readTimeout: 60000,
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

function postRssNews(encryptedRss: string): object {
  const rssNewsBaseUrl: string =
    app.config && app.config['ssb.baseUrl']
      ? app.config['ssb.baseUrl'] + '/rss/populate/news'
      : 'https://www.utv.ssb.no/rss/populate/news'

  const requestParams: HttpRequestParams = {
    url: rssNewsBaseUrl,
    method: 'POST',
    body: encryptedRss,
    connectionTimeout: 60000,
    readTimeout: 60000,
  }

  try {
    const pushRssNewsResponse: HttpResponse = request(requestParams)
    if (pushRssNewsResponse.status === 200) {
      return {
        message: 'Push av RSS nyheter OK',
        status: 'COMPLETED',
      }
    } else {
      return {
        message: 'Push av RSS nyheter feilet - ' + pushRssNewsResponse.status,
        status: Events.REQUEST_GOT_ERROR_RESPONSE,
      }
    }
  } catch (e) {
    return {
      message: 'Push av nyheter feilet - ' + e,
      status: Events.REQUEST_GOT_ERROR_RESPONSE,
    }
  }
}

function postRssStatkal(encryptedRss: string): object {
  const rssStatkalBaseUrl: string =
    app.config && app.config['ssb.baseUrl']
      ? app.config['ssb.baseUrl'] + '/rss/populate/statkal'
      : 'https://www.utv.ssb.no/rss/populate/statkal'

  const requestParams: HttpRequestParams = {
    url: rssStatkalBaseUrl,
    method: 'POST',
    body: encryptedRss,
    connectionTimeout: 60000,
    readTimeout: 60000,
  }

  try {
    const pushRssStatkalResponse: HttpResponse = request(requestParams)
    if (pushRssStatkalResponse.status === 200) {
      return { message: 'Push av RSS statkal OK', status: 'COMPLETED' }
    } else {
      return {
        message: `Push av RSS statkal til ${rssStatkalBaseUrl} feilet - ${pushRssStatkalResponse.status}`,
        status: Events.REQUEST_GOT_ERROR_RESPONSE,
      }
    }
  } catch (e) {
    return { message: 'Push av RSS statkal feilet - ' + e, status: Events.REQUEST_GOT_ERROR_RESPONSE }
  }
}

interface RssItems {
  body: string | null
  message: string
}
