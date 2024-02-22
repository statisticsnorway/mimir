import { mergeDeepRight } from '/lib/vendor/ramda'
import { createDefaultConfig } from '/lib/ssb/parts/highcharts/graph/config'

export function pieConfig(highchartContent, options) {
  const defaultConfig = createDefaultConfig(
    highchartContent.data,
    highchartContent.displayName,
    highchartContent.language
  )
  const customConfig = {
    chart: {
      type: 'pie',
    },
    yAxis: {
      stackLabels: {
        enabled: false,
        x: 0,
        y: 0,
      },
    },
  }
  return mergeDeepRight(defaultConfig, customConfig)
}
