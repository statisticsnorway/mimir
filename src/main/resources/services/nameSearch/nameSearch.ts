import { HttpRequestParams, HttpResponse } from 'enonic-types/http'
import { Request, Response } from 'enonic-types/controller'

import validator from 'validator'
const {
  request
} = __non_webpack_require__('/lib/http-client')

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
    app.config['ssb.solrNameSearch.baseUrl'] : 'https://i.ssb.no/solrmaster/navnesok/select'

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
      q: prepareQuery(sanitizeQuery(req.params.name)),
      wt: 'json'
    }
  }

  try {
    const result: HttpResponse = request(requestParams)
    const preparedBody: string = result.body ? prepareResult(result.body, sanitizeQuery(req.params.name)) : ''

    return {
      body: preparedBody,
      status: result.status,
      contentType: 'application/json'
    }
  } catch (err) {
    log.error(`Failed to fetch data from solr name search. ${err}`)

    return {
      body: err,
      status: err.status ? err.status : 500,
      contentType: 'application/json'
    }
  }
}

function prepareResult(result: string, name: string): string {
  const obj: {originalName: string} = JSON.parse(result)
  obj.originalName = name
  return JSON.stringify(obj)
}


function prepareQuery(input: string): string {
  if (input.split(' ').length == 1) return input
  else return pad(input) + '+' + input.split(' ').map((word) => pad(word)).join('+')
}

function pad(word: string): string {
  return '"' + word + '"'
}

function sanitizeQuery(name: string): string {
  const approved: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZÆØÅ '
  return validator.whitelist(replaceCharacters(name.toUpperCase()), approved )
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
