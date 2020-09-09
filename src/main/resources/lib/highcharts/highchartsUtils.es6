const {
  prepareHighchartsGraphConfig
} = __non_webpack_require__( '/lib/highcharts/highchartsGraphConfig')
const {
  mergeDeepRight
} = require('ramda')
const {
  prepareHighchartsData
} = __non_webpack_require__('/lib/highcharts/highchartsData')


export function createHighchartObject(req, highchartContent, data, dataFormat) {
  const highchartsData = prepareHighchartsData(req, highchartContent, data, dataFormat)
  const highchartsGraphConfig = prepareHighchartsGraphConfig(highchartContent, dataFormat, highchartsData && highchartsData.categories)
  return mergeDeepRight(highchartsData, highchartsGraphConfig)
}
