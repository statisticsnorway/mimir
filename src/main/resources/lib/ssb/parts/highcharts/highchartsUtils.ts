import type { Highchart } from '/site/content-types'
import { Content } from '/lib/xp/content'
import { JSONstat } from '/lib/types/jsonstat-toolkit'
import { TbmlDataUniform } from '/lib/types/xmlParser'
import type { DataSource } from '/site/mixins/dataSource'
import { HighchartsGraphConfig } from '/lib/types/highcharts'
import { SeriesAndCategories } from '/lib/ssb/parts/highcharts/highchartsData'
import { mergeDeepRight } from '/lib/vendor/ramda'

const { prepareHighchartsGraphConfig } = __non_webpack_require__('/lib/ssb/parts/highcharts/highchartsGraphConfig')
const { prepareHighchartsData } = __non_webpack_require__('/lib/ssb/parts/highcharts/highchartsData')

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

export interface HighchartsUtilsLib {
  createHighchartObject: (
    req: XP.Request,
    highchart: Content<Highchart>,
    data: JSONstat | TbmlDataUniform | object | string | undefined,
    dataSource: DataSource['dataSource']
  ) => HighchartsGraphConfig
}
