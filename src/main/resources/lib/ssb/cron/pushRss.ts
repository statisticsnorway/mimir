import { HttpLibrary, HttpRequestParams, HttpResponse } from 'enonic-types/http'
const http: HttpLibrary = __non_webpack_require__( '/lib/http-client')
const {
  encryptRssNews
} = __non_webpack_require__('/lib/cipher/cipherRss')

export function pushRssNews(): string {
  const newsServiceUrl: string = app.config && app.config['ssb.baseUrl'] ? app.config['ssb.baseUrl'] + '/_/service/mimir/news' :
    'https:www.utv.ssb.no/_/service/mimir/news'
  const rssNews: RssNews = getRssNews(newsServiceUrl)
  if (rssNews.body !== null) {
    const encryptedBody: string = encryptRssNews(rssNews.body)
    return postRssNews(encryptedBody)
  } else {
    return rssNews.message
  }
}

function getRssNews(url: string): RssNews {
  const requestParams: HttpRequestParams = {
    url,
    method: 'GET',
    readTimeout: 40000
  }

  const status: RssNews = {
    body: null,
    message: ''
  }

  try {
    const rssNewsResponse: HttpResponse = http.request(requestParams)
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
  const rssNewsBaseUrl: string = app.config && app.config['ssb.baseUrl'] ? app.config['ssb.baseUrl'] + '/rss/populate/news' :
    'https:www.utv.ssb.no/rss/populate/news'

  // Måtte legge på body i param da den ikke funket ved å legge til i requestParams
  const rssNewsUrl: string = rssNewsBaseUrl + '?body=' + encryptedRss.toString()

  const requestParams: HttpRequestParams = {
    url: rssNewsUrl,
    method: 'POST'
    // body: encryptedRss, Funker ikke
  }

  try {
    const pushRssNewsResponse: HttpResponse = http.request(requestParams)
    if (pushRssNewsResponse.status === 200) {
      return 'Push av RSS nyheter OK'
    } else {
      return 'Push av RSS nyheter feilet - ' + pushRssNewsResponse.status
    }
  } catch (e) {
    return 'Push av nyheter feilet - ' + e
  }
}

interface RssNews {
  body: string | null;
  message: string;
}

export interface PushRSSLib {
  pushRssNews: () => string;
}
