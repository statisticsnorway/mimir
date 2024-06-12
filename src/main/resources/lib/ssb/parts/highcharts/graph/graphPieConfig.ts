import { mergeDeepRight } from '/lib/vendor/ramda'
import { createDefaultConfig } from '/lib/ssb/parts/highcharts/graph/config'

interface HighchartContent {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any
  displayName: string
  language: string
}

export function pieConfig(highchartContent: HighchartContent) {
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
