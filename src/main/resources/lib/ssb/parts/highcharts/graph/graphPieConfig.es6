const {
  mergeDeepRight
} = __non_webpack_require__('/lib/vendor/ramda')
const {
  createDefaultConfig
} = __non_webpack_require__('/lib/ssb/parts/highcharts/graph/config')

export function pieConfig(highchartsContent, options) {
  const defaultConfig = createDefaultConfig(highchartsContent.data, highchartsContent.displayName, highchartsContent.language)
  const customConfig = {
    chart: {
      type: 'pie'
    },
    yAxis: {
      stackLabels: {
        enabled: false,
        x: 0,
        y: 0
      }
    }
  }
  return mergeDeepRight(defaultConfig, customConfig)
}
