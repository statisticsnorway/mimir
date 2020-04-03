import { HttpResponse, HttpLibrary } from 'enonic-types/lib/http'
import { ContextLibrary, RunContext } from 'enonic-types/lib/context'
import { Dataquery } from '../site/content-types/dataquery/dataquery'
import { Content, ContentLibrary, QueryResponse, PublishResponse } from 'enonic-types/lib/content'
import { Dataset } from '../site/content-types/dataset/dataset'
import * as moment from 'moment'
import { getTbmlData } from './tbml/tbml'
import { CommonLibrary } from './types/common'
const http: HttpLibrary = __non_webpack_require__('/lib/http-client')
const context: ContextLibrary = __non_webpack_require__('/lib/xp/context')
const content: ContentLibrary = __non_webpack_require__('/lib/xp/content')
const {
  sanitize
}: CommonLibrary =
    __non_webpack_require__('/lib/xp/common')
const defaultSelectionFilter: SelectionFilter = {
  filter: 'all',
  values: ['*']
}

const user: RunContext['user'] = {
  login: 'su',
  idProvider: 'system'
}
const draft: RunContext = { // Draft context (XP)
  repository: 'com.enonic.cms.default',
  branch: 'draft',
  principals: ['role:system.admin'],
  user
}

export function get(url: string, json: DataqueryRequestData | undefined, selection: SelectionFilter = defaultSelectionFilter): object | null {
  if (json && json.query) {
    for (const query of json.query) {
      if (query.code === 'KOKkommuneregion0000' || query.code === 'Region') {
        query.selection = selection
      }
    }
  }
  const method: string = json && json.query ? 'POST' : 'GET'
  const result: HttpResponse = http.request({
    url,
    method,
    contentType: 'application/json',
    headers: {
      'Cache-Control': 'no-cache',
      'Accept': 'application/json'
    },
    connectionTimeout: 20000,
    readTimeout: 5000,
    body: json ? JSON.stringify(json) : undefined
  })
  if (result.status !== 200) {
    log.error(`HTTP ${url} (${result.status} ${result.message})`)
  }
  if (result.status === 200 && result.body) {
    return JSON.parse(result.body)
  }
  return null
}

export function refreshDataset(dataquery: Content<Dataquery>): Content<Dataset> | undefined {
  const data: object | null = getData(dataquery)
  return data ? refreshDatasetWithData(JSON.stringify(data), dataquery) : undefined
}

export function refreshDatasetWithData(data: string, dataquery: Content<Dataquery>): Content<Dataset> | undefined {
  const dataset: Content<Dataset>| undefined = getDataset(dataquery)

  if (dataset) {
    // const datasetHasNewData: boolean = isDataNew(data, dataset)
    return isDataNew(data, dataset) ? updateDataset(data, dataset, dataquery) : undefined
  } else {
    return createDataset(data, dataquery)
  }
}

export function getData(dataquery: Content<Dataquery>): object | null {
  if (dataquery.data.table) {
    // TODO option-set is not parsed correctly by enonic-ts-codegen, update lib later and remove PlaceholderData interface
    const datasetFormat: Dataquery['datasetFormat'] = dataquery.data.datasetFormat
    let data: object | null = null
    try {
      if ((!datasetFormat || datasetFormat._selected === 'jsonStat')) {
        data = get(dataquery.data.table, dataquery.data.json && JSON.parse(dataquery.data.json))
      } else if (datasetFormat && datasetFormat._selected === 'klass') {
        data = get(dataquery.data.table, undefined)
      } else if (datasetFormat && datasetFormat._selected === 'tbml') {
        data = getTbmlData(dataquery.data.table)
      }
    } catch (e) {
      log.error(`Failed to fetch data for dataquery: ${dataquery._id} (${e})`)
    }
    return data
  }
  return null
}

export function isDataNew(data: string, dataset: Content<Dataset>): boolean {
  if (data && dataset) {
    return dataset.data.json !== data
  }
  return false
}

function updateDataset(data: string, dataset: Content<Dataset>, dataquery: Content<Dataquery>): Content<Dataset> |undefined {
  return context.run(draft, () => {
    const now: string = moment().format('DD.MM.YYYY HH:mm:ss')

    const update: Content<Dataset> = content.modify({
      key: dataset._id,
      editor: (r: ModifyContent<Dataset>): ModifyContent<Dataset> => {
        r.displayName = `${dataquery.displayName} (datasett) endret ${now}`
        r.data.table = dataquery.data.table
        r.data.json = data
        return r
      }
    })
    if (!update) {
      log.error(`Failed to update dataset: ${dataset._id}`)
    } else {
      publishDatasets([dataset._id])
      return content.get({
        key: dataset._id
      }) as Content<Dataset>
    }
    return
  })
}

function createDataset(data: string, dataquery: Content<Dataquery>): Content<Dataset> |undefined {
  return context.run(draft, () => {
    const now: string = moment().format('DD.MM.YYYY HH:mm:ss')
    const name: string = sanitize(`${dataquery._name} (datasett) opprettet ${now}`)
    const displayName: string = `${dataquery.displayName} (datasett) opprettet ${now}`
    try {
      const dataset: Content<Dataset> = content.create({
        name,
        displayName,
        parentPath: dataquery._path,
        contentType: `${app.name}:dataset`,
        data: {
          table: dataquery.data.table,
          dataquery: dataquery._id,
          json: data
        }
      }) as Content<Dataset>
      publishDatasets([dataset._id])
      return content.get({
        key: dataset._id
      }) as Content<Dataset>
    } catch (e) {
      log.error(`Failed to create dataset: ${e.code} ${e.message}`)
    }
    return
  })
}

export function getDataset(dataquery: Content<Dataquery>): Content<Dataset> | undefined {
  const datasets: QueryResponse<Dataset> = content.query({
    count: 1,
    contentTypes: [`${app.name}:dataset`],
    sort: 'createdTime DESC',
    query: `data.dataquery = '${dataquery._id}'`
  })

  if (datasets.count > 0) {
    return datasets.hits[0]
  }
  return
}

function publishDatasets(datasets: Array<string>): void {
  const published: PublishResponse = content.publish({
    keys: datasets,
    sourceBranch: 'draft',
    targetBranch: 'master',
    includeDependencies: false
  })
  if (published.failedContents.length > 0) {
    log.error(`Failed to publish dataset : ${published.failedContents.join(', ')}`)
  } else {
    // success, logging?
  }
}

export interface SelectionFilter {
  filter: string;
  values: Array<string>;
}

export interface DataqueryRequestData {
  query: Array<Dimension>;
  response: {
    format: string;
  };
}

export interface Dimension {
  code: string;
  selection: SelectionFilter;
}


// TODO create issue for enonic-types where read-only is blocking modify
interface ModifyContent<A extends object> extends Content<A> {
  displayName: string;
}

