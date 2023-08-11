import { request, HttpRequestParams, HttpResponse } from '/lib/http-client'
import { prepareGraph, type NameGraph } from '/lib/ssb/utils/nameSearchUtils'
import whitelist from 'validator/es/lib/whitelist'

const { isEnabled } = __non_webpack_require__('/lib/featureToggle')

export function get(req: XP.Request): XP.Response {
  if (!req.params.name) {
    return {
      body: {
        message: 'name parameter missing',
      },
      contentType: 'application/json',
    }
  }

  const solrBaseUrl: string =
    app.config && app.config['ssb.solrNameSearch.baseUrl']
      ? app.config['ssb.solrNameSearch.baseUrl']
      : 'https://www.ssb.no/solr/navnesok/select'

  const name: string = req.params.name.trim()
  const includeGraphData: boolean = req.params.includeGraphData === 'true'

  const requestParams: HttpRequestParams = {
    url: solrBaseUrl,
    method: 'get',
    contentType: 'application/json',
    headers: {
      'Cache-Control': 'no-cache',
      Accept: 'application/json',
    },
    connectionTimeout: 60000,
    readTimeout: 10000,
    params: {
      q: prepareQuery(sanitizeQuery(name)),
      wt: 'json',
    },
  }

  try {
    const result: HttpResponse = request(requestParams)
    const preparedBody: string = result.body ? prepareResult(result.body, sanitizeQuery(name), includeGraphData) : ''

    return {
      body: preparedBody,
      status: result.status,
      contentType: 'application/json',
    }
  } catch (err) {
    log.error(`Failed to fetch data from solr name search: ${solrBaseUrl}. ${err}`)

    return {
      body: err,
      status: err.status ? err.status : 500,
      contentType: 'application/json',
    }
  }
}

function prepareResult(result: string, name: string, includeGraphData: boolean): string {
  const nameSearchGraphEnabled: boolean = isEnabled('name-graph', true, 'ssb')
  const obj: ResultType = JSON.parse(result)
  obj.originalName = name
  obj.nameGraphData = nameSearchGraphEnabled && includeGraphData ? prepareGraph(name) : []
  return JSON.stringify(obj)
}

function prepareQuery(input: string): string {
  if (input.split(' ').length == 1) return input
  else
    return (
      pad(input) +
      input
        .split(' ')
        .map((word) => pad(word))
        .join('')
    )
}

function pad(word: string): string {
  return '"' + word + '"'
}

function sanitizeQuery(name: string): string {
  if (name.toLowerCase() === 'and' || name.toLowerCase() === 'or') {
    return name.toLowerCase()
  }
  const approved = 'ABCDEFGHIJKLMNOPQRSTUVWXYZÆØÅ '
  return whitelist(replaceCharacters(name.toUpperCase()), approved)
}

function replaceCharacters(name: string): string {
  return name
    .replace(/[ÈÉË]/, 'E')
    .replace(/[ÔÒÓ]/, 'O')
    .replace("'", '')
    .replace('Ä', 'Æ')
    .replace('Ü', 'Y')
    .replace('Ö', 'Ø')
    .replace(/[ÀÁ]/, 'A')
    .replace(/[ÐÞ∂þ]/, 'D')
}

interface ResultType {
  originalName: string
  nameGraphData: Array<NameGraph>
}
