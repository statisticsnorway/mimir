import { Content } from '/lib/xp/content'
import { type JSONstat } from '/lib/types/jsonstat-toolkit'
import { type TbmlDataUniform } from '/lib/types/xmlParser'
import { type HighchartsGraphConfig } from '/lib/types/highcharts'
import { SeriesAndCategories, prepareHighchartsData } from '/lib/ssb/parts/highcharts/highchartsData'
import { mergeDeepRight } from '/lib/vendor/ramda'

import {
  prepareHighchartsGraphConfig,
  prepareCombinedGraphConfig,
} from '/lib/ssb/parts/highcharts/highchartsGraphConfig'
import { type DataSource } from '/site/mixins/dataSource'
import { type CombinedGraph, type Highchart } from '/site/content-types'

export function createHighchartObject(
  req: XP.Request,
  highchart: Content<Highchart | CombinedGraph>,
  data: JSONstat | TbmlDataUniform | object | string | undefined,
  dataSource: DataSource['dataSource']
): HighchartsGraphConfig {
  const highchartsData: SeriesAndCategories | undefined = prepareHighchartsData(req, highchart, data, dataSource)
  const highchartsGraphConfig: HighchartsGraphConfig =
    highchart.type === `${app.name}:combinedGraph`
      ? prepareCombinedGraphConfig(
          highchart as Content<CombinedGraph>,
          highchartsData?.categories,
          highchartsData?.series
        )
      : prepareHighchartsGraphConfig(
          highchart as Content<Highchart>,
          dataSource,
          highchartsData && highchartsData.categories
        )
  return mergeDeepRight(highchartsData || {}, highchartsGraphConfig) as unknown as HighchartsGraphConfig
}
