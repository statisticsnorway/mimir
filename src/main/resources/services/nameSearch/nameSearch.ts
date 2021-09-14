import { HttpRequestParams, HttpResponse } from 'enonic-types/http'
import { Request, Response } from 'enonic-types/controller'
import { Dataset } from '../../lib/types/jsonstat-toolkit'
import { Content } from 'enonic-types/content'
import { CalculatorConfig } from '../../site/content-types/calculatorConfig/calculatorConfig'
import { DatasetRepoNode } from '../../lib/ssb/repo/dataset'

const {
  getCalculatorConfig, getNameSearchGraphData
} = __non_webpack_require__('/lib/ssb/dataset/calculator')

/* eslint-disable new-cap */
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import JSONstat from 'jsonstat-toolkit/import.mjs'

import validator from 'validator'
const {
  request
} = __non_webpack_require__('/lib/http-client')
const {
  isEnabled
} = __non_webpack_require__('/lib/featureToggle')

const nameSearchGraphEnabled: boolean = isEnabled('name-graph', true, 'ssb')


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
    app.config['ssb.solrNameSearch.baseUrl'] : 'https://www.ssb.no/solr/navnesok/select'

  const requestParams: HttpRequestParams = {
    url: solrBaseUrl,
    method: 'get',
    contentType: 'application/json',
    headers: {
      'Cache-Control': 'no-cache',
      'Accept': 'application/json'
    },
    connectionTimeout: 20000,
    readTimeout: 10000,
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
    log.error(`Failed to fetch data from solr name search: ${solrBaseUrl}. ${err}`)

    return {
      body: err,
      status: err.status ? err.status : 500,
      contentType: 'application/json'
    }
  }
}

function prepareResult(result: string, name: string): string {
  const obj: ResultType = JSON.parse(result)
  obj.originalName = name
  obj.nameGraph = nameSearchGraphEnabled ? prepareGraph(name) : []
  return JSON.stringify(obj)
}

function prepareGraph(name: string): Array<NameGraph> {
  const config: Content<CalculatorConfig> | undefined = getCalculatorConfig()

  const result: Array<NameGraph> = []
  const bankSaved: DatasetRepoNode<object | JSONstat> | null = config ? getNameSearchGraphData(config) : null

  try {
    const labels: Keyable = bankSaved?.data.dimension.Fornavn.category.label

    name.split(' ').forEach((n) => {
      const preparedName: string = n.charAt(0) + n.slice(1).toLowerCase()
      const nameCode: string | undefined = getKeyByValue(labels, preparedName)

      if (nameCode) {
        const dataset: KeyableNumberArray = JSONstat(bankSaved?.data).Dataset(0).Dice({
          'Fornavn': [nameCode]
        },
        {
          clone: true
        })
        result.push(
          {
            name: preparedName,
            data: dataset.value
          }
        )
      }
    }
    )
    return result
  } catch (error) {
    log.error(error)
    return result
  }
}


function getKeyByValue(object: Keyable, value: string): string | undefined {
  return Object.keys(object).find((key) => object[key] === value)
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
  return validator.whitelist(replaceCharacters(name.toUpperCase()), approved)
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

interface ResultType {
  originalName: string;
  nameGraph?: Array<NameGraph>;
}

interface NameGraph {
  name: string;
  data: Array<number>;
}

interface NameData {
  fornavn: Dataset | null;
  tid: Dataset | null;
}

interface Keyable {
  [key: string]: string;
}

interface KeyableNumberArray {
  [key: string]: Array<number>;
}

