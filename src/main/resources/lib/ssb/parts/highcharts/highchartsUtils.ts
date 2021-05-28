import { Request } from 'enonic-types/controller'
import { Highchart } from '../../../../site/content-types/highchart/highchart'
import { Content } from 'enonic-types/content'
import { JSONstat } from '../../../types/jsonstat-toolkit'
import { TbmlDataUniform } from '../../../types/xmlParser'
import { DataSource } from '../../../../site/mixins/dataSource/dataSource'
import { HighchartsGraphConfig } from '../../../types/highcharts'
import { HighchartsData } from './highchartsData'

const {
  prepareHighchartsGraphConfig
} = __non_webpack_require__( '/lib/ssb/parts/highcharts/highchartsGraphConfig')
const {
  mergeDeepRight
} = __non_webpack_require__('/lib/vendor/ramda')
const {
  prepareHighchartsData
} = __non_webpack_require__('/lib/ssb/parts/highcharts/highchartsData')


export function createHighchartObject(
  req: Request,
  highchart: Content<Highchart>,
  data: JSONstat | TbmlDataUniform | object | string | undefined,
  dataSource: DataSource['dataSource']): HighchartsGraphConfig {
  const highchartsData: HighchartsData = prepareHighchartsData(req, highchart, data, dataSource)
  const highchartsGraphConfig: HighchartsGraphConfig = prepareHighchartsGraphConfig(highchart, dataSource, highchartsData && highchartsData.categories)
  return mergeDeepRight(highchartsData, highchartsGraphConfig)
}

