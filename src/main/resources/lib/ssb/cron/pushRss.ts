import { HttpRequestParams, HttpResponse, request } from '/lib/http-client'
import { getRssItemsStatkal } from '/lib/ssb/rss/statkal'
import { getRssItemsNews } from '/lib/ssb/rss/news'
import { encryptRssNews, encryptRssStatkal } from '/lib/cipher/cipherRss'
import { Events } from '/lib/ssb/repo/query'

export function pushRssNews(): RssResult {
  const rssNews: string | null = getRssItemsNews()
  if (rssNews !== null) {
    const encryptedBody: string = encryptRssNews(rssNews)
    return postRssNews(encryptedBody)
  } else {
    return { message: 'Ingen nyheter å pushe til RSS' }
  }
}

export function pushRssStatkal(): RssResult {
  const rssStatkal: string | null = getRssItemsStatkal()
  if (rssStatkal !== null) {
    const encryptedBody: string = encryptRssStatkal(rssStatkal)
    return postRssStatkal(encryptedBody)
  } else {
    return { message: 'Ingen publiseringer å pushe til rss/statkal' }
  }
}

function postRssNews(encryptedRss: string): RssResult {
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
      }
    } else {
      log.error(
        `Push av RSS nyheter til ${rssNewsBaseUrl} feilet - status: ${pushRssNewsResponse.status}  message: ${pushRssNewsResponse.message}`
      )
      return {
        message: 'Push av RSS nyheter feilet - ' + pushRssNewsResponse.status,
        status: Events.REQUEST_GOT_ERROR_RESPONSE,
      }
    }
  } catch (e) {
    log.error(`Push av RSS nyheter feilet - ${e}`)
    return {
      message: 'Push av nyheter feilet - ' + e,
      status: Events.REQUEST_GOT_ERROR_RESPONSE,
    }
  }
}

function postRssStatkal(encryptedRss: string): RssResult {
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
      return { message: 'Push av RSS statkal OK' }
    } else {
      log.error(
        `Push av RSS statkal til ${rssStatkalBaseUrl} feilet - status: ${pushRssStatkalResponse.status}  message: ${pushRssStatkalResponse.message}`
      )
      return {
        message: `Push av RSS statkal til ${rssStatkalBaseUrl} feilet - ${pushRssStatkalResponse.status}`,
        status: Events.REQUEST_GOT_ERROR_RESPONSE,
      }
    }
  } catch (e) {
    log.error(`Push av RSS statkal feilet - ${e}`)
    return { message: 'Push av RSS statkal feilet - ' + e, status: Events.REQUEST_GOT_ERROR_RESPONSE }
  }
}

export interface RssResult {
  message: string
  status?: string
}
