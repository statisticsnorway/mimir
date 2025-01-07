import { mergeDeepRight } from '/lib/vendor/ramda'
import { createDefaultConfig } from '/lib/ssb/parts/highcharts/graph/config'

export function areaConfig(highchartContent, options) {
  const defaultConfig = createDefaultConfig(
    highchartContent.data,
    highchartContent.displayName,
    highchartContent.language
  )
  const customConfig = {
    chart: {
      type: 'area',
    },
    yAxis: {
      labels: {
        enabled: true,
      },
      stackLabels: {
        enabled: highchartContent.stacking === 'normal',
        // HC sets x or y := 0 by default, leaving no breathing space between the bar and the label
        x: 0,
        y: -5,
      },
    },
    xAxis: {
      categories:
        highchartContent.data.switchRowsAndColumns || !options.isJsonStat
          ? options.categories
          : [highchartContent.displayName],
    },
  }

  return mergeDeepRight(defaultConfig, customConfig)
}
