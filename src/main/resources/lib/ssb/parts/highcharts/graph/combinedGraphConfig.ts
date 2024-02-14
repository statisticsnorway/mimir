import { mergeDeepRight } from '/lib/vendor/ramda'
import { createDefaultConfig } from '/lib/ssb/parts/highcharts/graph/config'

export function combinedGraphConfig(highchartContent, options) {
  log.info('\x1b[32m%s\x1b[0m', '9. combinedGraphConfig')
  const defaultConfig = createDefaultConfig(
    highchartContent.data,
    highchartContent.displayName,
    highchartContent.language
  )
  const customConfig = {
    chart: {
      zoomType: 'xy',
      type: undefined,
      marginTop: 70,
    },
    series: options.series,
    yAxis: options.yAxis,
    xAxis: {
      categories:
        highchartContent.data.switchRowsAndColumns || !options.isJsonStat
          ? options.categories
          : [highchartContent.displayName],
    },
  }

  return mergeDeepRight(defaultConfig, customConfig)
}
