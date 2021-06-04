import { StatisticInListing } from '../dashboard/statreg/types'
__non_webpack_require__('/lib/ssb/polyfills/nashorn')
import { Content } from 'enonic-types/content'
import { HttpResponse } from 'enonic-types/http'
import { DataSource } from '../../../site/mixins/dataSource/dataSource'
import { TbmlDataUniform, XmlParser } from '../../types/xmlParser'
import { DatasetRepoNode, DataSource as DataSourceType } from '../repo/dataset'
import { JSONstat } from '../../types/jsonstat-toolkit'
import { JobStatus } from '../repo/job'
import { DefaultPageConfig } from '../../../site/pages/default/default-page-config'
import { Statistics } from '../../../site/content-types/statistics/statistics'

const xmlParser: XmlParser = __.newBean('no.ssb.xp.xmlparser.XmlParser')
const {
  request
} = __non_webpack_require__('/lib/http-client')
const {
  getTableIdFromTbprocessor
} = __non_webpack_require__('/lib/ssb/dataset/tbprocessor/tbprocessor')
const {
  getTableIdFromStatbankApi
} = __non_webpack_require__('/lib/ssb/dataset/statbankApi/statbankApi')
const {
  getDataset
} = __non_webpack_require__('/lib/ssb/dataset/dataset')
const {
  cronJobLog
} = __non_webpack_require__('/lib/ssb/utils/serverLog')
const {
  getParentType, getParentContent
} = __non_webpack_require__('/lib/ssb/utils/parentUtils')

const {
  fetchStatisticsWithReleaseToday
} = __non_webpack_require__('/lib/ssb/statreg/statistics')

function fetchRSS(): Array<RSSItem> {
  const statbankRssUrl: string | undefined = app.config && app.config['ssb.rss.statbank'] ? app.config['ssb.rss.statbank'] : 'https://www.ssb.no/rss/statbank'
  if (statbankRssUrl) {
    const response: HttpResponse = request({
      url: statbankRssUrl
    })
    if (response && response.body) {
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

function getSavedQuerysStatistic(dataSources: Array<Content<DataSource>>): Array<Content<DataSource>> {
  const savedQuerysStatistics: Array<Content<DataSource>> = dataSources.filter((datasource) =>
      datasource.data.dataSource?._selected === 'statbankSaved' && getParentType(datasource._path) === 'mimir:statistics')

  const statisticsWithReleaseToday: Array<string> = fetchStatisticsWithReleaseToday().map((s: StatisticInListing) => s.id.toString())

  return savedQuerysStatistics.reduce((acc: Array<Content<DataSource>>, datasource) => {
    const parentContent: Content<object, DefaultPageConfig> | null = getParentContent(datasource._path)
    if (parentContent && parentContent.type === 'mimir:statistics') {
      const statisticContent: Content<Statistics> = parentContent
      if (statisticContent.data.statistic && statisticsWithReleaseToday.includes(statisticContent.data.statistic.toString())) {
        acc.push(datasource)
      }
    }
    return acc
  }, [])
}

function parentTypeFilter(dataSources: Array<Content<DataSource>>): Array<Content<DataSource>> {
  return dataSources.filter((datasource) => getParentType(datasource._path) !== 'mimir:statistics')
}

function inRSSItems(dataSource: Content<DataSource>, dataset: DatasetRepoNode<JSONstat | TbmlDataUniform | object>, RSSItems: Array<RSSItem>): boolean {
  let keys: Array<string> = []
  if (dataSource.data.dataSource?.tbprocessor?.urlOrId) {
    keys = keys.concat(getTableIdFromTbprocessor(dataset.data as TbmlDataUniform))
  }
  if (dataSource.data.dataSource?.statbankApi?.urlOrId) {
    const statbankApiTableId: string | undefined = getTableIdFromStatbankApi(dataSource)
    if (statbankApiTableId) {
      keys.push(statbankApiTableId)
    }
  }
  return RSSItems.filter((item) => {
    const tableId: string = item['ssbrss:tableid'].toString()
    const tableIdAsNumber: number = parseInt(tableId) // remove "0" from start of tableId
    if (keys.includes(tableId) || keys.includes(tableIdAsNumber.toString()) || keys.length === 0) { // check for 04859 and 4859
      return true
    }
    return false
  }).length > 0
}

export function dataSourceRSSFilter(dataSources: Array<Content<DataSource>>): RSSFilter {
  let filteredDatasources: Array<Content<DataSource>> = parentTypeFilter(dataSources)
  const savedQuerysStatisticsToday: Array<Content<DataSource>> = getSavedQuerysStatistic(dataSources)
  if (savedQuerysStatisticsToday.length > 0) {
    filteredDatasources = filteredDatasources.concat(savedQuerysStatisticsToday)
  }

  const today: number = new Date().getDate()
  const RSSItems: Array<RSSItem> = fetchRSS()
    .filter((item) => new Date(item.pubDate).getDate() === today) // only keep those with updates today

  const logData: RSSFilterLogData = {
    start: filteredDatasources.map((ds) => ds._id),
    noData: [],
    otherDataType: [],
    inRSSOrNoKey: [],
    skipped: [],
    end: []
  }

  const filteredDatasourcesRSS: Array<Content<DataSource>> = filteredDatasources.reduce((t: Array<Content<DataSource>>, dataSource) => {
    if (isValidType(dataSource)) {
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
          status: JobStatus.SKIPPED
        })
      }
    } else {
      logData.otherDataType.push(dataSource._id)
      t.push(dataSource)
    }
    return t
  }, [])

  logData.end = filteredDatasourcesRSS.map((ds) => ds._id)
  cronJobLog(JSON.stringify(logData, null, 2))

  return {
    logData,
    filteredDataSources: filteredDatasourcesRSS
  }
}

export interface RSSFilterLogData {
  start: Array<string>;
  noData: Array<string>;
  otherDataType: Array<string>;
  inRSSOrNoKey: Array<string>;
  skipped: Array<DataSourceInfo>;
  end: Array<string>;
}

export interface DataSourceInfo {
  id: string;
  displayName: string;
  contentType: string;
  dataSourceType?: string;
  status: string;
  hasError?: boolean;
}

export interface RSSFilter {
  logData: RSSFilterLogData;
  filteredDataSources: Array<Content<DataSource>>;
}

interface RSS {
  rss: {
    'xmlns:ssbrss': string;
    channel: {
      item: Array<RSSItem>;
    };
  };
}

interface RSSItem {
  'ssbrss:shortname': string;
  'ssbrss:date': string;
  'ssbrss:tablename': string;
  link: string;
  description: string;
  guid: {
    idPermaLink: boolean;
    content: string;
  };
  'ssbrss:tableid': string | number;
  'ssbrss:contact': Array<RSSContact> | RSSContact;
  title: string;
  category: string;
  pubDate: string;
}

interface RSSContact {
  'ssbrss:person': string;
  'ssbrss:phone': number | string;
  'ssbrss:email': string;
}

export interface DatasetRSSLib {
  dataSourceRSSFilter: (dataSources: Array<Content<DataSource>>) => RSSFilter;
}
