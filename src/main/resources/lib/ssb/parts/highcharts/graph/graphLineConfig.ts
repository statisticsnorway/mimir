import { mergeDeepRight } from '/lib/vendor/ramda'
import { createDefaultConfig } from '/lib/ssb/parts/highcharts/graph/config'

export function lineConfig(highchartContent, options) {
  const defaultConfig = createDefaultConfig(
    highchartContent.data,
    highchartContent.displayName,
    highchartContent.language
  )
  const customConfig = {
    chart: {
      type: 'line',
    },
    yAxis: {
      stackLabels: {
        enabled: highchartContent.stacking === 'normal',
        x: 0,
        y: -5,
      },
    },
    tooltip: {
      crosshairs: {
        width: 1,
        color: '#9575ff',
        dashStyle: 'solid',
      },
    },
    xAxis: {
      labels: {
        enabled: true,
      },
      categories:
        highchartContent.data.switchRowsAndColumns || !options.isJsonStat
          ? options.categories
          : [highchartContent.displayName],
      gridLineWidth: 0,
    },
  }
  return mergeDeepRight(defaultConfig, customConfig)
}
