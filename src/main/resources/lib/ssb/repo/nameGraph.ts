import { create as createRepo, get as getRepo } from '/lib/xp/repo'
import { run } from '/lib/xp/context'
import { connect, type NodeCreateParams, type RepoConnection } from '/lib/xp/node'
import { Dimension } from '../../types/jsonstat-toolkit'
import { DatasetRepoNode } from '../../../lib/ssb/repo/dataset'
// @ts-ignore
import JSONstat from 'jsonstat-toolkit/import.mjs'

export const REPO_ID_NAME_GRAPH: 'no.ssb.name.graph' = 'no.ssb.name.graph' as const
const { getNameGraphDataWithConfig } = __non_webpack_require__('/lib/ssb/dataset/calculator')

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

export function fillRepo(names: Array<NameGraph>) {
  if (getRepo(REPO_ID_NAME_GRAPH) === null) {
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

    const content: NameGraph = createContentName({
      displayName: name.displayName,
      nameCode: name.nameCode,
      data: name.data,
    })

    try {
      if (!exists) {
        connection.create<NameGraph>(content)
      } else {
        connection.modify<NameGraph>({
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

function getNameGraph(): Array<NameGraph> {
  const result: Array<NameGraph> = []
  const bankSaved: DatasetRepoNode<object | JSONstat> | null = getNameGraphDataWithConfig()
  const labels: Keyable = bankSaved?.data.dimension.Fornavn.category.label

  const fornavn: Dimension | null = JSONstat(bankSaved?.data).Dataset('dataset').Dimension('Fornavn') as Dimension
  const names: Array<string> = fornavn?.id as Array<string>
  const namesTest: Array<string> = names.slice(0, 10)

  try {
    namesTest.forEach(function (name) {
      log.info('Name: ' + name)
      const dataset: KeyableNumberArray = JSONstat(bankSaved?.data)
        .Dataset(0)
        .Dice(
          {
            Fornavn: [name],
          },
          {
            clone: true,
          }
        )
      result.push({
        displayName: labels[name],
        nameCode: name,
        data: dataset.value,
      })
    })

    return result
  } catch (error) {
    log.error(error)
    return result
  }
}

function createContentName(params: NameGraph): NameGraph & NodeCreateParams {
  const { displayName, nameCode, data } = params
  return {
    displayName: displayName,
    _name: displayName,
    _inheritsPermissions: true,
    nameCode: nameCode,
    data: data,
  }
}

interface NameGraph {
  displayName: string
  nameCode: string
  data: Array<number>
}

interface Keyable {
  [key: string]: string
}

interface KeyableNumberArray {
  [key: string]: Array<number>
}
