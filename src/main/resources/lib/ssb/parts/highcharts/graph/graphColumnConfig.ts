import { mergeDeepRight } from '/lib/vendor/ramda'
import { createDefaultConfig } from '/lib/ssb/parts/highcharts/graph/config'

export function columnConfig(highchartContent, options) {
  const defaultConfig = createDefaultConfig(
    highchartContent.data,
    highchartContent.displayName,
    highchartContent.language
  )
  const customConfig = {
    chart: {
      type: 'column',
    },
    yAxis: {
      stackLabels: {
        enabled: 'false',
        x: 0,
        y: 0,
      },
    },
    xAxis: {
      labels: {
        enable: highchartContent.data.switchRowsAndColumns || !options.isJsonStat,
      },
      categories:
        highchartContent.data.switchRowsAndColumns || !options.isJsonStat
          ? options.categories
          : [highchartContent.displayName],
      tickmarkPlacement: 'between',
    },
  }

  return mergeDeepRight(defaultConfig, customConfig)
}
