import { type Content } from '/lib/xp/content'
import { mergeDeepRight } from '/lib/vendor/ramda'
import { createDefaultConfig } from '/lib/ssb/parts/highcharts/graph/config'
import { GetCombinedGraphOptions } from '/lib/ssb/parts/highcharts/highchartsGraphConfig'
import { CombinedGraph } from '/site/content-types'

export function combinedGraphConfig(highchartContent: Content<CombinedGraph>, options: GetCombinedGraphOptions) {
  log.info('\x1b[32m%s\x1b[0m', '7. combinedGraphConfig')
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
      categories: options.categories ?? [highchartContent.displayName],
    },
  }

  return mergeDeepRight(defaultConfig, customConfig)
}
