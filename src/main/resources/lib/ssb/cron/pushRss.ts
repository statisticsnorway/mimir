import { HttpRequestParams, HttpResponse } from '/lib/http-client'
const { request } = __non_webpack_require__('/lib/http-client')
const { encryptRssNews, encryptRssStatkal } = __non_webpack_require__('/lib/cipher/cipherRss')

export function pushRssNews(): string {
  const newsServiceUrl: string =
    app.config && app.config['ssb.baseUrl']
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
  const statkalReleasesServiceUrl: string =
    app.config && app.config['ssb.baseUrl']
      ? app.config['ssb.baseUrl'] + '/_/service/mimir/statkalReleases'
      : 'https://www.utv.ssb.no/_/service/mimir/statkalReleases'
  const rssStatkal: RssItems = getRssStatkal(statkalReleasesServiceUrl)
  if (rssStatkal.body !== null) {
    const encryptedBody: string = encryptRssStatkal(rssStatkal.body)
    return postRssStatkal(encryptedBody)
  } else {
    return rssStatkal.message
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

function getRssStatkal(url: string): RssItems {
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
    const rssStatkalResponse: HttpResponse = request(requestParams)
    if (rssStatkalResponse.status === 200) {
      if (rssStatkalResponse.body) {
        status.body = rssStatkalResponse.body
      } else {
        status.message = 'Ingen publiseringer å pushe til rss/statkal'
      }
    } else {
      status.message = 'Henting av publiseringer XP feilet - ' + rssStatkalResponse.status
    }
  } catch (e) {
    status.message = 'Henting av publiseringer XP feilet - ' + e
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
      return 'Push av RSS statkal feilet - ' + pushRssStatkalResponse.status
    }
  } catch (e) {
    return 'Push av RSS statkal feilet - ' + e
  }
}

interface RssItems {
  body: string | null
  message: string
}

export interface PushRSSLib {
  pushRssNews: () => string
  pushRssStatkal: () => string
}
