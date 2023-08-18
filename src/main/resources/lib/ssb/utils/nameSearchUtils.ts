import { request, HttpRequestParams, HttpResponse } from '/lib/http-client'
import type { Content } from '/lib/xp/content'
import type { CalculatorConfig } from '/site/content-types'
import type { DatasetRepoNode } from '/lib/ssb/repo/dataset'
import type { Data, Dataset, Dimension } from '/lib/types/jsonstat-toolkit'
import { getNameGraphDataFromRepo, type NameData, nameGraphRepoExists } from '/lib/ssb/repo/nameGraph'
// @ts-ignore
import JSONstat from 'jsonstat-toolkit/import.mjs'
import whitelist from 'validator/es/lib/whitelist'

const { getCalculatorConfig, getNameSearchGraphData } = __non_webpack_require__('/lib/ssb/dataset/calculator')
const { isEnabled } = __non_webpack_require__('/lib/featureToggle')

export function nameSearchResult(name: string, includeGraphData: boolean): SolrResponse {
  const solrBaseUrl: string =
    app.config && app.config['ssb.solrNameSearch.baseUrl']
      ? app.config['ssb.solrNameSearch.baseUrl']
      : 'https://www.ssb.no/solr/navnesok/select'

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
    }
  } catch (err) {
    log.error(`Failed to fetch data from solr name search: ${solrBaseUrl}. ${err}`)

    return {
      body: err,
      status: err.status ? err.status : 500,
    }
  }
}

export function prepareNameGraphResult(name: string): string {
  const nameSearchGraphEnabled: boolean = isEnabled('name-graph', true, 'ssb')
  const obj: ResultType = JSON.parse('{}')
  obj.originalName = name
  obj.nameGraph = nameSearchGraphEnabled ? prepareGraph(name) : []
  return JSON.stringify(obj)
}

export function prepareGraph(name: string): Array<NameGraph> {
  return nameGraphRepoExists() ? prepareGraphRepo(name) : prepareGraphDataset(name)
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

//Uses when repo dont exist
function prepareGraphDataset(name: string): Array<NameGraph> {
  const config: Content<CalculatorConfig> | undefined = getCalculatorConfig()

  const result: Array<NameGraph> = []
  const bankSaved: DatasetRepoNode<object | JSONstat> | null = config ? getNameSearchGraphData(config) : null
  const nameGraphDataset: Dataset | null = bankSaved ? JSONstat(bankSaved.data).Dataset('dataset') : null
  const time: Dimension | null = nameGraphDataset?.Dimension('Tid') as Dimension
  const years: Array<string> = time?.id as Array<string>

  try {
    const labels: Keyable = bankSaved?.data.dimension.Fornavn.category.label
    const names: string[] = name.split(' ')
    //TODO: Add limitation on max number of names?

    names.forEach((n) => {
      const preparedName: string = n.charAt(0) + n.slice(1).toLowerCase()
      const nameCode: string | undefined = getKeyByValue(labels, preparedName)

      if (nameCode) {
        const values: number[] = years.map((year) => {
          const data: Data | null = nameGraphDataset?.Data({
            Fornavn: nameCode,
            Tid: year,
          }) as Data

          return Number(data.value)
        })
        result.push({
          name: preparedName,
          data: values,
        })
      }
    })
    return result
  } catch (error) {
    log.error(error)
    return result
  }
}

function prepareGraphRepo(name: string): Array<NameGraph> {
  const names: string[] = name.split(' ')
  //TODO: Add limitation on max number of names?
  const result: Array<NameGraph> = []

  try {
    const nameDataRepo: NameData[] = getNameGraphDataFromRepo(names)
    nameDataRepo.forEach((name) => {
      result.push({
        name: name.displayName,
        data: name.data,
      })
    })

    return result
  } catch (error) {
    log.error(error)
    return result
  }
}

function getKeyByValue(object: Keyable, value: string): string | undefined {
  return Object.keys(object).find((key) => object[key] === value)
}

interface ResultType {
  originalName: string
  nameGraph?: Array<NameGraph>
}

export interface NameGraph {
  name: string
  data: Array<number>
}

interface Keyable {
  [key: string]: string
}

export interface SolrResponse {
  status: number
  body: string | null
}
export type NameSearchUtilsLib = typeof import('./nameSearchUtils')
