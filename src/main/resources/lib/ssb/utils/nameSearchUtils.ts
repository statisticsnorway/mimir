import type { Content } from '/lib/xp/content'
import type { CalculatorConfig } from '/site/content-types'
import type { DatasetRepoNode } from '/lib/ssb/repo/dataset'
import type { Data, Dataset, Dimension } from '/lib/types/jsonstat-toolkit'
import { getNameGraphDataFromRepo, type NameData, nameGraphRepoExists } from '/lib/ssb/repo/nameGraph'
// @ts-ignore
import JSONstat from 'jsonstat-toolkit/import.mjs'

const { getCalculatorConfig, getNameSearchGraphData } = __non_webpack_require__('/lib/ssb/dataset/calculator')
const { isEnabled } = __non_webpack_require__('/lib/featureToggle')

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
export type NameSearchUtilsLib = typeof import('./nameSearchUtils')
