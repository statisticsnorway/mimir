import { StatisticInListing } from '../dashboard/statreg/types'
__non_webpack_require__('/lib/ssb/polyfills/nashorn')
import { Content } from '/lib/xp/content'
import { request, HttpResponse } from '/lib/http-client'
import { DataSource } from '../../../site/mixins/dataSource/dataSource'
import { TbmlDataUniform, XmlParser } from '../../types/xmlParser'
import { DatasetRepoNode, DataSource as DataSourceType } from '../repo/dataset'
import { JSONstat } from '../../types/jsonstat-toolkit'
import { JobStatus } from '../repo/job'
import { DefaultPageConfig } from '../../../site/pages/default/default-page-config'
import { Statistics } from '../../../site/content-types/statistics/statistics'
import { Statistic } from '../../../site/mixins/statistic/statistic'

const xmlParser: XmlParser = __.newBean('no.ssb.xp.xmlparser.XmlParser')
const { moment } = __non_webpack_require__('/lib/vendor/moment')
const { getTableIdFromTbprocessor } = __non_webpack_require__('/lib/ssb/dataset/tbprocessor/tbprocessor')
const { getTableIdFromStatbankApi } = __non_webpack_require__('/lib/ssb/dataset/statbankApi/statbankApi')
const { getDataset } = __non_webpack_require__('/lib/ssb/dataset/dataset')
const { cronJobLog } = __non_webpack_require__('/lib/ssb/utils/serverLog')
const { getParentType, getParentContent } = __non_webpack_require__('/lib/ssb/utils/parentUtils')

const { fetchStatisticsWithReleaseToday } = __non_webpack_require__('/lib/ssb/statreg/statistics')

function fetchRSS(): Array<RSSItem> {
  const statbankRssUrl: string | undefined =
    app.config && app.config['ssb.rss.statbank'] ? app.config['ssb.rss.statbank'] : 'https://www.ssb.no/rss/statbank'
  if (statbankRssUrl) {
    const response: HttpResponse = request({
      url: statbankRssUrl,
    })
    if (response && response.body) {
      cronJobLog(`STATBANK RSS :: ${response.body}`)
      const data: string = xmlParser.parse(response.body)
      const rss: RSS = JSON.parse(data)
      return rss.rss.channel.item
    }
  }
  return []
}

function isValidType(dataSource: Content<DataSource>): boolean {
  if (dataSource.data.dataSource && dataSource.data.dataSource._selected) {
    const dataSourceType: string = dataSource.data.dataSource._selected
    if (dataSourceType === DataSourceType.STATBANK_API || dataSourceType === DataSourceType.TBPROCESSOR) {
      return true
    }
  }

  return false
}

function isSavedQuerysStatistic(statisticsWithReleaseToday: Array<string>, dataSource: Content<DataSource>): boolean {
  const isSavedQuery: boolean = dataSource.data.dataSource?._selected === 'statbankSaved'
  if (isSavedQuery) {
    const parentContent: Content<object, DefaultPageConfig | Statistics> | null = getParentContent(dataSource._path)
    if (parentContent && parentContent.type === `${app.name}:statistics`) {
      const statisticContent: Content<Statistics & Statistic> = parentContent as Content<Statistics>
      if (
        statisticContent.data.statistic &&
        statisticsWithReleaseToday.includes(statisticContent.data.statistic.toString())
      ) {
        return true
      }
    }
  }

  return false
}

function inRSSItems(
  dataSource: Content<DataSource>,
  dataset: DatasetRepoNode<JSONstat | TbmlDataUniform | object>,
  RSSItems: Array<RSSItem>
): boolean {
  let keys: Array<string> = []
  if (dataSource.data.dataSource) {
    if (
      dataSource.data.dataSource._selected === DataSourceType.TBPROCESSOR &&
      dataSource.data.dataSource.tbprocessor.urlOrId
    ) {
      keys = keys.concat(getTableIdFromTbprocessor(dataset.data as TbmlDataUniform))
    }
    if (
      dataSource.data.dataSource._selected === DataSourceType.STATBANK_API &&
      dataSource.data.dataSource?.statbankApi?.urlOrId
    ) {
      const statbankApiTableId: string | undefined = getTableIdFromStatbankApi(dataSource)
      if (statbankApiTableId) {
        keys.push(statbankApiTableId)
      }
    }
  }
  return (
    RSSItems.filter((item) => {
      const tableId: string = item['ssbrss:tableid'].toString()
      const tableIdAsNumber: number = parseInt(tableId) // remove "0" from start of tableId
      if (keys.includes(tableId) || keys.includes(tableIdAsNumber.toString()) || keys.length === 0) {
        // check for 04859 and 4859
        return true
      }
      return false
    }).length > 0
  )
}

export function dataSourceRSSFilter(dataSources: Array<Content<DataSource>>): RSSFilter {
  const logData: RSSFilterLogData = {
    start: dataSources.map((ds) => ds._id),
    noData: [],
    otherDataType: [],
    inRSSOrNoKey: [],
    skipped: [],
    statistics: [],
    end: [],
  }

  const RSSItems: Array<RSSItem> = fetchRSS().filter((item) =>
    moment(item.pubDate).isBetween(moment().subtract(1, 'day'), moment(), 'day', '[]')
  ) // only keep those with updates for the last 2 days
  const statisticsWithReleaseToday: Array<string> = fetchStatisticsWithReleaseToday().map((s: StatisticInListing) =>
    s.id.toString()
  )

  const filteredDatasourcesRSS: Array<Content<DataSource>> = dataSources.reduce(
    (t: Array<Content<DataSource>>, dataSource) => {
      const parentType: string | undefined = getParentType(dataSource._path)
      if (parentType === `${app.name}:statistics`) {
        // only keep datasources from statistics if they are saved queries with release today
        logData.statistics.push(dataSource._id)
        if (isSavedQuerysStatistic(statisticsWithReleaseToday, dataSource)) {
          t.push(dataSource)
        }
      } else if (isValidType(dataSource)) {
        const dataset: DatasetRepoNode<JSONstat | TbmlDataUniform | object> | null = getDataset(dataSource)
        if (!dataset) {
          logData.noData.push(dataSource._id)
          t.push(dataSource)
        } else if (inRSSItems(dataSource, dataset, RSSItems)) {
          logData.inRSSOrNoKey.push(dataSource._id)
          t.push(dataSource)
        } else {
          logData.skipped.push({
            id: dataSource._id,
            displayName: dataSource.displayName,
            contentType: dataSource.type,
            dataSourceType: dataSource.data.dataSource?._selected,
            status: JobStatus.SKIPPED,
          })
        }
      } else {
        logData.otherDataType.push(dataSource._id)
        t.push(dataSource)
      }
      return t
    },
    []
  )

  logData.end = filteredDatasourcesRSS.map((ds) => ds._id)
  cronJobLog(JSON.stringify(logData, null, 2))

  return {
    logData,
    filteredDataSources: filteredDatasourcesRSS,
  }
}

export interface RSSFilterLogData {
  start: Array<string>
  noData: Array<string>
  otherDataType: Array<string>
  inRSSOrNoKey: Array<string>
  statistics: Array<string>
  skipped: Array<DataSourceInfo>
  end: Array<string>
}

export interface DataSourceInfo {
  id: string
  displayName: string
  contentType: string
  dataSourceType?: string
  status: string
  hasError?: boolean
}

export interface RSSFilter {
  logData: RSSFilterLogData
  filteredDataSources: Array<Content<DataSource>>
}

interface RSS {
  rss: {
    'xmlns:ssbrss': string
    channel: {
      item: Array<RSSItem>
    }
  }
}

interface RSSItem {
  'ssbrss:shortname': string
  'ssbrss:date': string
  'ssbrss:tablename': string
  link: string
  description: string
  guid: {
    idPermaLink: boolean
    content: string
  }
  'ssbrss:tableid': string | number
  'ssbrss:contact': Array<RSSContact> | RSSContact
  title: string
  category: string
  pubDate: string
}

interface RSSContact {
  'ssbrss:person': string
  'ssbrss:phone': number | string
  'ssbrss:email': string
}

export interface DatasetRSSLib {
  dataSourceRSSFilter: (dataSources: Array<Content<DataSource>>) => RSSFilter
}
