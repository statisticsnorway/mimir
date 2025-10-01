import '/lib/ssb/polyfills/nashorn'
import { Content } from '/lib/xp/content'
import { DatasetRepoNode, DataSource as dataSourceType, getDataset, DATASET_BRANCH } from '/lib/ssb/repo/dataset'
import { type TbmlDataUniform, type TbmlSourceListUniform } from '/lib/types/xmlParser'
import {
  TbprocessorParsedResponse,
  getTbmlData,
  TbProcessorTypes,
  isInternalTable,
  isNewPublicTable,
} from '/lib/ssb/dataset/tbprocessor/tbml'
import { mergeDeepLeft } from '/lib/vendor/ramda'

import { logUserDataQuery, Events } from '/lib/ssb/repo/query'
import { isUrl } from '/lib/ssb/utils/utils'
import { type DataSource } from '/site/mixins/dataSource'

export function getTbprocessor(content: Content<DataSource>, branch: string): DatasetRepoNode<TbmlDataUniform> | null {
  if (content.data.dataSource && content.data.dataSource._selected === dataSourceType.TBPROCESSOR) {
    const dataSource: DataSource['dataSource'] = content.data.dataSource
    if (dataSource.tbprocessor && dataSource.tbprocessor.urlOrId) {
      const language: string = content.language || ''
      return getDataset(
        content.data.dataSource?._selected,
        branch,
        `${getTbprocessorKey(content)}${language === 'en' ? language : ''}`
      )
    }
  }
  return null
}

function hasTBProcessorDatasource(content: Content<DataSource>): string | undefined {
  return content.data.dataSource &&
    content.data.dataSource._selected === dataSourceType.TBPROCESSOR &&
    content.data.dataSource.tbprocessor &&
    content.data.dataSource.tbprocessor.urlOrId
    ? content.data.dataSource.tbprocessor.urlOrId
    : undefined
}

function tryRequestTbmlData<T extends TbmlDataUniform | TbmlSourceListUniform>(
  url: string,
  contentId?: string,
  processXml?: string,
  type?: string
): TbprocessorParsedResponse<T> | null {
  try {
    return getTbmlData(url, contentId, processXml, type) as TbprocessorParsedResponse<T>
  } catch (e) {
    const message = `Failed to fetch ${
      type ? formatTbProcessorType(type) : 'data'
    } from tbprocessor${url ? ` (${url})` : ''}: ${contentId}. (${e === 'java.io.EOFException' ? 'java.io.EOFException: Connection closed prematurely' : e})`
    if (contentId) {
      logUserDataQuery(contentId, {
        file: '/lib/ssb/dataset/tbprocessor/tbprocessor.ts',
        function: 'tryRequestTbmlData',
        message: Events.REQUEST_COULD_NOT_CONNECT,
        info: message,
        status: e,
      })
    }
    log.error(message)
    return null
  }
}

function formatTbProcessorType(type: string): string {
  switch (type) {
    case TbProcessorTypes.SOURCE_LIST:
      return 'source list'
    case TbProcessorTypes.DATA_SET:
      return 'data set'
    default:
      return 'data'
  }
}

function getDataAndMetaData(
  content: Content<DataSource>,
  processXml?: string
): TbprocessorParsedResponse<TbmlDataUniform> | null {
  const baseUrl: string = app.config?.['ssb.tbprocessor.serverside.baseUrl'] ?? 'https://ext-i.ssb.no/tbprocessor'
  const dataPath = `/process/tbmldata/`
  const sourceListPath = `/document/sourceList/`
  const language: string = content.language || ''

  const tbmlKey: string = getTbprocessorKey(content)
  let tbmlDataUrl = `${baseUrl}${dataPath}${tbmlKey}${language === 'en' ? `?lang=${language}` : ''}`
  let sourceListUrl = `${baseUrl}${sourceListPath}${tbmlKey}`

  const dataSource: DataSource['dataSource'] = content.data.dataSource
  if (
    dataSource &&
    dataSource._selected === dataSourceType.TBPROCESSOR &&
    dataSource.tbprocessor &&
    isUrl(dataSource.tbprocessor.urlOrId)
  ) {
    const tbprocessorUrl = fixTbProcessorUrl(dataSource.tbprocessor.urlOrId as string)
    tbmlDataUrl = `${tbprocessorUrl}${language === 'en' ? `?lang=${language}` : ''}`
    sourceListUrl = `${tbprocessorUrl}`.replace(dataPath, sourceListPath)
  }

  const tbmlParsedResponse: TbprocessorParsedResponse<TbmlDataUniform> | null = tryRequestTbmlData<TbmlDataUniform>(
    tbmlDataUrl,
    content._id,
    processXml,
    TbProcessorTypes.DATA_SET
  )

  if (
    tbmlParsedResponse &&
    (tbmlParsedResponse.status === 200 || isInternalTable(tbmlParsedResponse) || isNewPublicTable(tbmlParsedResponse))
  ) {
    if (isInternalTable(tbmlParsedResponse) || isNewPublicTable(tbmlParsedResponse)) {
      tbmlParsedResponse.status = 200

      const datasetRepo: DatasetRepoNode<TbmlDataUniform> | null = getDataset(
        dataSourceType.TBPROCESSOR,
        DATASET_BRANCH,
        tbmlKey
      )
      if (datasetRepo && datasetRepo.data) {
        const data: TbmlDataUniform = datasetRepo.data as TbmlDataUniform
        tbmlParsedResponse.parsedBody = {
          tbml: {
            presentation: data.tbml.presentation,
            metadata: {
              instance: data.tbml.metadata.instance,
              tablesource: data.tbml.metadata.tablesource,
              title: data.tbml.metadata.title,
              category: data.tbml.metadata.category,
              shortnameweb: data.tbml.metadata.shortnameweb,
              tags: data.tbml.metadata.tags,
              notes: data.tbml.metadata.notes,
            },
          },
        }
      } else {
        tbmlParsedResponse.parsedBody = {
          tbml: {
            presentation: {
              table: {
                thead: [],
                tbody: [],
                class: 'statistics',
              },
            },
            metadata: {
              instance: {
                publicRelatedTableIds: [],
                language: 'no',
                relatedTableIds: [],
                definitionId: parseInt(tbmlKey),
              },
              tablesource: '',
              title: {
                noterefs: '',
                content: '',
              },
              category: '',
              shortnameweb: '',
              tags: '',
              notes: {
                note: [],
              },
            },
          },
        }
      }
    }
    const tbmlDataAndSourceList: TbmlDataUniform | null = addSourceList(sourceListUrl, tbmlParsedResponse, content._id)
    return {
      ...tbmlParsedResponse,
      parsedBody: tbmlDataAndSourceList ? tbmlDataAndSourceList : tbmlParsedResponse.parsedBody,
    }
  } else {
    return tbmlParsedResponse
  }
}

function addSourceList(
  sourceListUrl: string,
  tbmlParsedResponse: TbprocessorParsedResponse<TbmlDataUniform>,
  contentId: string
): TbmlDataUniform | null {
  const sourceListParsedResponse: TbprocessorParsedResponse<TbmlSourceListUniform> | null =
    tryRequestTbmlData<TbmlSourceListUniform>(sourceListUrl, contentId, undefined, TbProcessorTypes.SOURCE_LIST)

  const sourceListObject: object | undefined =
    sourceListParsedResponse && sourceListParsedResponse.parsedBody
      ? {
          tbml: {
            metadata: {
              sourceList: sourceListParsedResponse.parsedBody.sourceList.tbml.source,
              sourceListStatus: sourceListParsedResponse.status,
            },
          },
        }
      : {
          tbml: {
            metadata: {
              sourceListStatus: sourceListParsedResponse?.status,
            },
          },
        }

  return tbmlParsedResponse && tbmlParsedResponse.parsedBody && sourceListObject
    ? (mergeDeepLeft(tbmlParsedResponse.parsedBody, sourceListObject) as TbmlDataUniform)
    : null
}

function fixTbProcessorUrl(url: string): string {
  if (url.includes('/i.test.ssb.no')) {
    return url.replace('/i.test.ssb.no', '/ext-i.test.ssb.no')
  }
  if (url.includes('/i.qa.ssb.no')) {
    return url.replace('/i.qa.ssb.no', '/ext-i.qa.ssb.no')
  }
  if (url.includes('/i.ssb.no')) {
    return url.replace('/i.ssb.no', '/ext-i.ssb.no')
  }
  return url
}

export function fetchTbprocessorData(
  content: Content<DataSource>,
  processXml?: string
): TbprocessorParsedResponse<TbmlDataUniform> | null {
  const urlOrId: string | undefined = hasTBProcessorDatasource(content)
  return urlOrId ? getDataAndMetaData(content, processXml) : null
}

export function getTbprocessorKey(content: Content<DataSource>): string {
  if (
    content.data.dataSource &&
    content.data.dataSource._selected === dataSourceType.TBPROCESSOR &&
    content.data.dataSource.tbprocessor &&
    content.data.dataSource.tbprocessor.urlOrId
  ) {
    let key: string = content.data.dataSource.tbprocessor.urlOrId
    if (isUrl(key)) {
      key = key.replace(/\/$/, '')
      const split: Array<string> = key.split('/')
      key = split[split.length - 1]
    }
    return key
  }
  return content._id // fallback, should never find anything
}

export function getTableIdFromTbprocessor(data: TbmlDataUniform): Array<string> {
  if (
    data &&
    data.tbml &&
    data.tbml.metadata &&
    data.tbml.metadata.instance &&
    data.tbml.metadata.instance.publicRelatedTableIds
  ) {
    return data.tbml.metadata.instance.publicRelatedTableIds
  }
  return []
}

export interface FetchTbProcessorData {
  status: number
  body: string
}
