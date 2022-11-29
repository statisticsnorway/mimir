import type { NameData } from '/lib/ssb/repo/nameGraph'
import { getNameGraphDataFromRepo } from '/lib/ssb/repo/nameGraph'

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
  const names: string[] = name.split(' ')
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
