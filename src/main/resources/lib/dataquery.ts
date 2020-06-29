import { HttpResponse, HttpLibrary, HttpRequestParams } from 'enonic-types/lib/http'
import { ContextLibrary, RunContext } from 'enonic-types/lib/context'
import { Dataquery } from '../site/content-types/dataquery/dataquery'
import { Content, ContentLibrary, QueryResponse, PublishResponse } from 'enonic-types/lib/content'
import { Dataset } from '../site/content-types/dataset/dataset'
import * as moment from 'moment'
import { CommonLibrary } from './types/common'

const {
  getTbmlData
} = __non_webpack_require__('/lib/tbml/tbml')
const {
  Events, logUserDataQuery, logAdminDataQuery
} = __non_webpack_require__('/lib/repo/query')
const {
  getDataSetWithDataQueryId
} = __non_webpack_require__('/lib/ssb/dataset')
const http: HttpLibrary = __non_webpack_require__('/lib/http-client')
const context: ContextLibrary = __non_webpack_require__('/lib/xp/context')
const content: ContentLibrary = __non_webpack_require__('/lib/xp/content')
const {
  sanitize
}: CommonLibrary = __non_webpack_require__('/lib/xp/common')

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

export function get(url: string,
  json: DataqueryRequestData | undefined,
  selection: SelectionFilter = defaultSelectionFilter,
  queryId?: string ): object | null {
  if (json && json.query) {
    for (const query of json.query) {
      if (query.code === 'KOKkommuneregion0000' || query.code === 'Region') {
        query.selection = selection
      }
    }
  }
  const method: string = json && json.query ? 'POST' : 'GET'
  const requestParams: HttpRequestParams = {
    url,
    method,
    contentType: 'application/json',
    headers: {
      'Cache-Control': 'no-cache',
      'Accept': 'application/json'
    },
    connectionTimeout: 20000,
    readTimeout: 5000,
    body: json ? JSON.stringify(json) : ''
  }

  const result: HttpResponse = http.request(requestParams)
  if (queryId) {
    logUserDataQuery(queryId, {
      message: Events.REQUESTING_DATA,
      response: result,
      request: requestParams
    })
  }

  if (result.status !== 200) {
    log.error(`HTTP ${url} (${result.status} ${result.message})`)
  }
  if (result.status === 200 && result.body) {
    return JSON.parse(result.body)
  }
  return null
}

export interface RefreshDatasetResult {
  dataqueryId: string;
  dataset?: Content<Dataset>;
  status: string;
  message?: string;
  newDatasetData?: boolean;
}

export function refreshQuery(dataquery: Content<Dataquery>): Content<Dataset> | RefreshDatasetResult {
  logAdminDataQuery(dataquery._id, {
    message: Events.GET_DATA_STARTED
  })

  const rawData: object | null = getData(dataquery)
  if (rawData) {
    const refreshDatasetResult: RefreshDatasetResult = refreshDatasetWithData(JSON.stringify(rawData), dataquery)
    logAdminDataQuery(dataquery._id, {
      message: refreshDatasetResult.status
    })
    return refreshDatasetResult
  } else {
    const refreshDatasetResult: RefreshDatasetResult = {
      dataqueryId: dataquery._id,
      status: 'Raw data is null'
    }
    logAdminDataQuery(dataquery._id, {
      message: refreshDatasetResult.status,
      info: rawData || 'rawData is null'
    })
    return refreshDatasetResult
  }
}

export function refreshDatasetWithData(rawData: string, dataquery: Content<Dataquery>): RefreshDatasetResult {
  const dataset: QueryResponse<Dataset> | undefined = getDataSetWithDataQueryId(dataquery._id)
  if (!dataset || (dataset && dataset.total === 0) ) {
    return createDataset(rawData, dataquery)
  }
  if (dataset && isDataNew(rawData, dataset.hits[0])) {
    updateDataset(rawData, dataset.hits[0], dataquery)
    return {
      newDatasetData: true,
      dataqueryId: dataquery._id,
      dataset: dataset.hits[0],
      status: Events.GET_DATA_COMPLETE
    }
  } else {
    return {
      dataqueryId: dataquery._id,
      dataset: dataset.hits[0],
      status: Events.NO_NEW_DATA
    }
  }
}

export function getData(dataquery: Content<Dataquery>): object | null {
  if (dataquery.data.table) {
    // TODO option-set is not parsed correctly by enonic-ts-codegen, update lib later and remove PlaceholderData interface
    const datasetFormat: Dataquery['datasetFormat'] = dataquery.data.datasetFormat
    logUserDataQuery(dataquery._id, {
      message: 'Request with dataset',
      info: {
        table: dataquery.data.table,
        datasetFormat
      }
    })
    let data: object | null = null
    try {
      if ((!datasetFormat || datasetFormat._selected === 'jsonStat')) {
        data = get(dataquery.data.table, dataquery.data.json && JSON.parse(dataquery.data.json), undefined, dataquery._id)
      } else if (datasetFormat && datasetFormat._selected === 'klass') {
        data = get(dataquery.data.table, undefined, undefined, dataquery._id)
      } else if (datasetFormat && datasetFormat._selected === 'tbml') {
        data = getTbmlData(dataquery.data.table, dataquery._id)
      }
    } catch (e) {
      const message: string = `Failed to fetch data for dataquery: ${dataquery._id} (${e})`
      logUserDataQuery(dataquery._id, {
        message: Events.FAILED_TO_REQUEST_DATASET,
        info: {
          table: dataquery.data.table,
          message
        }
      })
      log.error(message)
    }
    return data
  }
  log.error(`Failed to find data table from dataquery`)
  return null
}

function isDataNew(data: string, dataset: Content<Dataset>): boolean {
  if (data && dataset) {
    return dataset.data.json !== data
  }
  return false
}

function updateDataset(data: string, dataset: Content<Dataset>, dataquery: Content<Dataquery>): RefreshDatasetResult {
  return context.run(draft, () => {
    const now: string = moment().format('DD.MM.YYYY HH:mm:ss')

    const update: Content<Dataset> = content.modify({
      key: dataset._id,
      editor: (r: Content<Dataset>): Content<Dataset> => {
        return {
          ...r,
          displayName: `${dataquery.displayName} (datasett) endret ${now}`,
          data: {
            dataquery: dataquery._id,
            table: dataquery.data.table,
            json: data
          }
        }
      }
    })

    if (!update) {
      const message: string = `Failed to update dataset: ${dataset._id}`
      log.error(message)
      return {
        dataqueryId: dataquery._id,
        status: Events.FAILED_TO_REFRESH_DATASET,
        dataset,
        message
      }
    } else {
      publishDatasets([dataset._id])
      return {
        dataqueryId: dataquery._id,
        status: Events.DATASET_UPDATED,
        dataset
      }
    }
  })
}

function createDataset(data: string, dataquery: Content<Dataquery>): RefreshDatasetResult {
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
      const publishResult: PublishResponse = publishDatasets([dataset._id])

      return {
        newDatasetData: true,
        dataqueryId: dataquery._id,
        dataset,
        status: Events.DATASET_PUBLISHED
      }
    } catch (e) {
      const message: string = `Failed to create dataset: ${e.code} ${e.message}`
      log.error(message)
      return {
        dataqueryId: dataquery._id,
        status: Events.FAILED_TO_CREATE_DATASET,
        message
      }
    }
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

function publishDatasets(datasets: Array<string>): PublishResponse {
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
  return published
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

