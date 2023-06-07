import { request, HttpRequestParams, HttpResponse } from '/lib/http-client'
import { Content } from '/lib/xp/content'
import type { CalculatorConfig } from '/site/content-types'
import { DatasetRepoNode } from '/lib/ssb/repo/dataset'

// @ts-ignore
import JSONstat from 'jsonstat-toolkit/import.mjs'
import whitelist from 'validator/es/lib/whitelist'

const { getCalculatorConfig, getNameSearchGraphData } = __non_webpack_require__('/lib/ssb/dataset/calculator')
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
    const preparedBody: string = result.body ? prepareResult(result.body, sanitizeQuery(name)) : ''

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

function prepareResult(result: string, name: string): string {
  const nameSearchGraphEnabled: boolean = isEnabled('name-graph', true, 'ssb')
  const obj: ResultType = JSON.parse(result)
  obj.originalName = name
  obj.nameGraph = nameSearchGraphEnabled ? graphAvailable(name) : false
  return JSON.stringify(obj)
}

// Checks if any of the searched for names have graph data available.
// Uses cached graphData, and returns true for first possible hit.
// 250ms on first run, 5-10 on subsequent runs.
function graphAvailable(name: string): boolean {
  const config: Content<CalculatorConfig> | undefined = getCalculatorConfig()

  const bankSaved: DatasetRepoNode<object | JSONstat> | null = config ? getNameSearchGraphData(config) : null

  const labels: Keyable = bankSaved?.data.dimension.Fornavn.category.label

  const exists: boolean = name.split(' ').some((name) => checkKeysForValue(labels, name))
  return exists
}

function checkKeysForValue(object: Keyable, value: string): boolean {
  const preparedName: string = value.charAt(0) + value.slice(1).toLowerCase()
  return !!Object.keys(object).find((key) => object[key] === preparedName)
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
  nameGraph?: boolean
}

interface Keyable {
  [key: string]: string
}
