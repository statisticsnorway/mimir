import { Content } from '/lib/xp/content'
import { JSONstat } from '/lib/types/jsonstat-toolkit'
import { TbmlDataUniform } from '/lib/types/xmlParser'
import { HighchartsGraphConfig } from '/lib/types/highcharts'
import {
  SeriesAndCategories,
  prepareHighchartsData,
  prepareCombinedGraphData,
} from '/lib/ssb/parts/highcharts/highchartsData'
import { mergeDeepRight } from '/lib/vendor/ramda'

import {
  prepareHighchartsGraphConfig,
  prepareCombinedGraphConfig,
} from '/lib/ssb/parts/highcharts/highchartsGraphConfig'
import { type DataSource } from '/site/mixins/dataSource'
import { type CombinedGraph, type Highchart } from '/site/content-types'

export function createHighchartObject(
  req: XP.Request,
  highchart: Content<Highchart>,
  data: JSONstat | TbmlDataUniform | object | string | undefined,
  dataSource: DataSource['dataSource']
): HighchartsGraphConfig {
  const highchartsData: SeriesAndCategories | undefined = prepareHighchartsData(req, highchart, data, dataSource)
  const highchartsGraphConfig: HighchartsGraphConfig = prepareHighchartsGraphConfig(
    highchart,
    dataSource,
    highchartsData && highchartsData.categories
  )
  return mergeDeepRight(highchartsData || {}, highchartsGraphConfig) as unknown as HighchartsGraphConfig
}

export function createCombinedGraphObject(
  req: XP.Request,
  combinedGraph: Content<CombinedGraph>,
  data: JSONstat | TbmlDataUniform | object | string | undefined,
  dataSource: DataSource['dataSource']
): HighchartsGraphConfig {
  log.info('\x1b[32m%s\x1b[0m', '3. createCombinedGraphObject')
  const combinedGraphData: SeriesAndCategories | undefined = prepareCombinedGraphData(
    req,
    combinedGraph,
    data,
    dataSource
  )

  //log.info('\x1b[32m%s\x1b[0m', 'combinedGraphData: ' + JSON.stringify(combinedGraphData, null, 2))
  const combinedGraphConfig: HighchartsGraphConfig = prepareCombinedGraphConfig(
    combinedGraph,
    combinedGraphData?.categories,
    combinedGraphData?.series
  )
  return mergeDeepRight(combinedGraphData || {}, combinedGraphConfig) as unknown as HighchartsGraphConfig
}
