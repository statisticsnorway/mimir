import { Content } from '/lib/xp/content'
import { CalculatorConfig } from '../../site/content-types/calculatorConfig/calculatorConfig'
import { DatasetRepoNode } from '../../lib/ssb/repo/dataset'

const { getCalculatorConfig, getNameSearchGraphData } = __non_webpack_require__('/lib/ssb/dataset/calculator')

/* eslint-disable new-cap */
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import JSONstat from 'jsonstat-toolkit/import.mjs'

import validator from 'validator'
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

  try {
    const preparedBody: string = prepareResult(sanitizeQuery(req.params.name))

    return {
      body: preparedBody,
      status: 200,
      contentType: 'application/json',
    }
  } catch (err) {
    return {
      body: err,
      status: err.status ? err.status : 500,
      contentType: 'application/json',
    }
  }
}

function prepareResult(name: string): string {
  const nameSearchGraphEnabled: boolean = isEnabled('name-graph', true, 'ssb')
  const obj: ResultType = JSON.parse('{}')
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
        const dataset: KeyableNumberArray = JSONstat(bankSaved?.data)
          .Dataset(0)
          .Dice(
            {
              Fornavn: [nameCode],
            },
            {
              clone: true,
            }
          )
        result.push({
          name: preparedName,
          data: dataset.value,
        })
      }
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

function sanitizeQuery(name: string): string {
  const approved = 'ABCDEFGHIJKLMNOPQRSTUVWXYZÆØÅ '
  return validator.whitelist(replaceCharacters(name.toUpperCase()), approved)
}

function replaceCharacters(name: string): string {
  return name
    .replace('É', 'E')
    .replace('È', 'E')
    .replace('Ô', 'O')
    .replace("'", '')
    .replace('Ä', 'Æ')
    .replace('Ü', 'Y')
    .replace('Ö', 'Ø')
}

interface ResultType {
  originalName: string
  nameGraph?: Array<NameGraph>
}

interface NameGraph {
  name: string
  data: Array<number>
}

interface Keyable {
  [key: string]: string
}

interface KeyableNumberArray {
  [key: string]: Array<number>
}
