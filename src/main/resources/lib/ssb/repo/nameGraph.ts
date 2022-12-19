import { create as createRepo } from '/lib/xp/repo'
import { run } from '/lib/xp/context'
import { connect, type NodeCreateParams, type NodeQueryResponse, type RepoConnection } from '/lib/xp/node'
import type { Data, Dataset, Dimension } from '../../types/jsonstat-toolkit'
import type { DatasetRepoNode } from '../../../lib/ssb/repo/dataset'
// @ts-ignore
import JSONstat from 'jsonstat-toolkit/import.mjs'

export const REPO_ID_NAME_GRAPH: 'no.ssb.name.graph' = 'no.ssb.name.graph' as const
const { getNameGraphDataWithConfig } = __non_webpack_require__('/lib/ssb/dataset/calculator')
const {
  data: { forceArray },
} = __non_webpack_require__('/lib/util')
const { getRepo } = __non_webpack_require__('/lib/ssb/repo/repo')

export function nameGraphRepoExists(): boolean {
  return !!getRepo(REPO_ID_NAME_GRAPH, 'master')
}

export function createOrUpdateNameGraphRepo(): void {
  log.info(`Initiating "${REPO_ID_NAME_GRAPH}"`)
  run(
    {
      user: {
        login: 'su',
        idProvider: 'system',
      },
      branch: 'master',
    },
    () => {
      fillRepo(getNameGraph())
      log.info(`Finished initiating "${REPO_ID_NAME_GRAPH}"`)
    }
  )
}

export function fillRepo(names: Array<NameData>) {
  if (getRepo(REPO_ID_NAME_GRAPH, 'master') === null) {
    createRepo({
      id: REPO_ID_NAME_GRAPH,
      rootPermissions: [
        {
          principal: 'role:system.admin',
          allow: ['READ', 'CREATE', 'MODIFY', 'DELETE', 'PUBLISH', 'READ_PERMISSIONS', 'WRITE_PERMISSIONS'],
          deny: [],
        },
        {
          principal: 'role:system.everyone',
          allow: ['READ'],
          deny: [],
        },
      ],
    })
  }

  const connection: RepoConnection = connect({
    repoId: REPO_ID_NAME_GRAPH,
    branch: 'master',
  })

  names.forEach((name) => {
    const path = `/${name.displayName}`
    const exists: Array<string> = connection.exists(path)

    const content: NameData = createContentName({
      displayName: name.displayName,
      nameCode: name.nameCode,
      data: name.data,
    })

    try {
      if (!exists) {
        connection.create<NameData>(content)
      } else {
        connection.modify<NameData>({
          key: path,
          editor: (node) => {
            return {
              ...node,
              displayName: content.displayName,
              nameCode: content.displayName,
              data: content.data,
            }
          },
        })
      }
    } catch (error) {
      log.error('Noe gikk galt med navn: ' + content.nameCode + ' Feilmelding: ' + error)
    }
  })
}

export function getRepoConnectionNameGraph(): RepoConnection {
  return connect({
    repoId: REPO_ID_NAME_GRAPH,
    branch: 'master',
  })
}

export function getNameGraphDataFromRepo(names: string[]): NameData[] {
  const connectionNameGraphRepo: RepoConnection = getRepoConnectionNameGraph()
  const res: NodeQueryResponse = connectionNameGraphRepo.query({
    count: 10,
    filters: {
      boolean: {
        must: [
          {
            hasValue: {
              field: 'displayName',
              values: forceArray(names),
            },
          },
        ],
      },
    },
  })

  return res.hits.map((hit) => connectionNameGraphRepo.get(hit.id))
}

function getNameGraph(): Array<NameData> {
  const result: Array<NameData> = []
  const nameGraphData: DatasetRepoNode<object | JSONstat> | null = getNameGraphDataWithConfig()
  const nameGraphDataset: Dataset | null = nameGraphData ? JSONstat(nameGraphData.data).Dataset('dataset') : null
  const labels: Keyable = nameGraphData?.data.dimension.Fornavn.category.label
  const fornavn: Dimension | null = nameGraphDataset?.Dimension('Fornavn') as Dimension
  const tid: Dimension | null = nameGraphDataset?.Dimension('Tid') as Dimension
  const names: Array<string> = fornavn?.id as Array<string>
  const years: Array<string> = tid?.id as Array<string>

  try {
    names.forEach(function (name) {
      const values: number[] = years.map((year) => {
        const data: Data | null = nameGraphDataset?.Data({
          Fornavn: name,
          Tid: year,
        }) as Data

        return Number(data.value)
      })
      result.push({
        displayName: labels[name],
        nameCode: name,
        data: values,
      })
    })

    return result
  } catch (error) {
    log.error(error)
    return result
  }
}

function createContentName(params: NameData): NameData & NodeCreateParams {
  const { displayName, nameCode, data } = params
  return {
    displayName: displayName,
    _name: displayName,
    _inheritsPermissions: true,
    nameCode: nameCode,
    data: data,
  }
}

export interface NameData {
  displayName: string
  nameCode: string
  data: Array<number>
}

interface Keyable {
  [key: string]: string
}
