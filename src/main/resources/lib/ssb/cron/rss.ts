__non_webpack_require__('/lib/ssb/polyfills/nashorn')
import { Content } from '/lib/xp/content'
import { StatisticInListing } from '/lib/ssb/dashboard/statreg/types'
import { request, HttpResponse } from '/lib/http-client'
import { TbmlDataUniform, XmlParser } from '/lib/types/xmlParser'
import { DatasetRepoNode, DataSource as DataSourceType } from '/lib/ssb/repo/dataset'
import { JSONstat } from '/lib/types/jsonstat-toolkit'
import { JobStatus } from '/lib/ssb/repo/job'
import { subDays, isWithinInterval } from '/lib/ssb/utils/dateUtils'

const xmlParser: XmlParser = __.newBean('no.ssb.xp.xmlparser.XmlParser')
import { getTableIdFromTbprocessor } from '/lib/ssb/dataset/tbprocessor/tbprocessor'
import { getTableIdFromStatbankApi } from '/lib/ssb/dataset/statbankApi/statbankApi'
import { getDataset } from '/lib/ssb/dataset/dataset'
import { cronJobLog } from '/lib/ssb/utils/serverLog'
import { getParentType, getParentContent } from '/lib/ssb/utils/parentUtils'

import { fetchStatisticsWithReleaseToday } from '/lib/ssb/statreg/statistics'
import { type Statistic } from '/site/mixins/statistic'
import { type Statistics } from '/site/content-types'
import { type DataSource } from '/site/mixins/dataSource'

function fetchRSS(): Array<RSSItem> {
  const statbankRssUrl: string | undefined = app.config?.['ssb.rss.statbank'] || 'https://www.ssb.no/rss/statbank'
  if (statbankRssUrl) {
    const response: HttpResponse = request({
      url: statbankRssUrl,
    })
    if (response?.body) {
      cronJobLog(`STATBANK RSS :: ${response.body}`)
      const data: string = xmlParser.parse(response.body)
      const rss: RSS = JSON.parse(data)
      return rss.rss.channel.item
    }
  }
  return []
}

function isValidType(dataSource: Content<DataSource>): boolean {
  if (dataSource?.data?.dataSource?._selected) {
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
    const parentContent = getParentContent(dataSource._path)
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

  // only keep those with updates for the last 2 days, to the end of today
  const RSSItems: Array<RSSItem> = fetchRSS().filter((item) =>
    isWithinInterval(new Date(item.pubDate), {
      start: subDays(new Date(), 1),
      end: new Date().setHours(23, 59, 59, 999),
    })
  )

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
