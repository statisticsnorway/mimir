__non_webpack_require__('/lib/polyfills/nashorn')
import { Content } from 'enonic-types/content'
import { HttpLibrary, HttpResponse } from 'enonic-types/http'
import { DataSource } from '../../../site/mixins/dataSource/dataSource'
import { TbmlData, XmlParser } from '../../types/xmlParser'
import { DatasetRepoNode, DataSource as DataSourceType } from '../../repo/dataset'
import { TbprocessorLib } from './tbprocessor'
import { StatbankApiLib } from './statbankApi'
import { DatasetLib } from './dataset'
import { JSONstat } from '../../types/jsonstat-toolkit'

const xmlParser: XmlParser = __.newBean('no.ssb.xp.xmlparser.XmlParser')
const http: HttpLibrary = __non_webpack_require__( '/lib/http-client')
const {
  getTableIdFromTbprocessor
}: TbprocessorLib = __non_webpack_require__( '/lib/ssb/dataset/tbprocessor')
const {
  getTableIdFromStatbankApi
}: StatbankApiLib = __non_webpack_require__( '/lib/ssb/dataset/statbankApi')
const {
  getDataset
}: DatasetLib = __non_webpack_require__( '/lib/ssb/dataset/dataset')

function fetchRSS(): Array<RSSItem> {
  const statbankRssUrl: string | undefined = app.config && app.config['ssb.rss.statbank'] ? app.config['ssb.rss.statbank'] : 'https://www.ssb.no/rss/statbank'
  if (statbankRssUrl) {
    const response: HttpResponse = http.request({
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

function inRSSItems(dataSource: Content<DataSource>, dataset: DatasetRepoNode<JSONstat | TbmlData | object>, RSSItems: Array<RSSItem>): boolean {
  let keys: Array<string> = []
  if (dataSource.data.dataSource?.tbprocessor?.urlOrId) {
    keys = keys.concat(getTableIdFromTbprocessor(dataset.data as TbmlData))
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

export function dataSourceRSSFilter(dataSources: Array<Content<DataSource>>): Array<Content<DataSource>> {
  const today: number = new Date().getDate()
  const RSSItems: Array<RSSItem> = fetchRSS()
    .filter((item) => new Date(item.pubDate).getDate() === today) // only keep those with updates today

  const logData: RSSFilterLogData = {
    start: dataSources.length,
    noData: 0,
    otherDataType: 0,
    inRSSOrNoKey: 0,
    end: 0
  }

  const filteredDataSources: Array<Content<DataSource>> = dataSources.reduce((t: Array<Content<DataSource>>, dataSource) => {
    if (isValidType(dataSource)) {
      const dataset: DatasetRepoNode<JSONstat | TbmlData | object> | null = getDataset(dataSource)
      if (!dataset) {
        logData.noData += 1
        t.push(dataSource)
      } else if (inRSSItems(dataSource, dataset, RSSItems)) {
        logData.inRSSOrNoKey += 1
        t.push(dataSource)
      }
    } else {
      logData.otherDataType += 1
      t.push(dataSource)
    }
    return t
  }, [])

  logData.end = filteredDataSources.length
  log.info(JSON.stringify(logData, null, 2))

  return filteredDataSources
}

interface RSSFilterLogData{
  start: number;
  noData: number;
  otherDataType: number;
  inRSSOrNoKey: number;
  end: number;
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
  'ssbrss:phone': number;
  'ssbrss:email': string;
}
