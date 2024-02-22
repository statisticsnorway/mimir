import { Content } from '/lib/xp/content'
import { JSONstat } from '/lib/types/jsonstat-toolkit'
import { TbmlDataUniform } from '/lib/types/xmlParser'
import { HighchartsGraphConfig } from '/lib/types/highcharts'
import { SeriesAndCategories, prepareHighchartsData } from '/lib/ssb/parts/highcharts/highchartsData'
import { mergeDeepRight } from '/lib/vendor/ramda'

import { prepareHighchartsGraphConfig } from '/lib/ssb/parts/highcharts/highchartsGraphConfig'
import { type DataSource } from '/site/mixins/dataSource'
import { type Highchart } from '/site/content-types'

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
