import { HttpLibrary, HttpRequestParams, HttpResponse } from 'enonic-types/http'
import { Request, Response } from 'enonic-types/controller'

const http: HttpLibrary = __non_webpack_require__('/lib/http-client')

export function get(req: Request): Response {
  if (!req.params.name) {
    return {
      body: {
        message: 'name parameter missing'
      },
      contentType: 'application/json'
    }
  }
  const solrBaseUrl: string = app.config && app.config['ssb.solrNameSearch.baseUrl'] ?
    app.config['ssb.solrNameSearch.baseUrl'] : 'https://i.qa.ssb.no/solrmaster/navnesok/select'

  const requestParams: HttpRequestParams = {
    url: solrBaseUrl,
    method: 'get',
    contentType: 'application/json',
    headers: {
      'Cache-Control': 'no-cache',
      'Accept': 'application/json'
    },
    connectionTimeout: 20000,
    readTimeout: 5000,
    params: {
      q: replaceCharacters(req.params.name),
      wt: 'json'
    }
  }

  const result: HttpResponse = http.request(requestParams)

  return {
    body: result.body ? result.body : '',
    status: result.status,
    contentType: 'application/json'
  }
}

function replaceCharacters(name: string): string {
  return name.replace('É', 'E')
    .replace('È', 'E')
    .replace('Ô', 'O')
    .replace("'", '')
    .replace('Ä', 'Æ')
    .replace('Ü', 'Y')
    .replace('Ö', 'Ø')
}
