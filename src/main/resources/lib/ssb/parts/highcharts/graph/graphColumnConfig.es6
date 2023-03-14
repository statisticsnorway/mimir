import { mergeDeepRight } from '/lib/vendor/ramda'
const { createDefaultConfig } = __non_webpack_require__('/lib/ssb/parts/highcharts/graph/config')

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
        enabled: highchartContent.stacking === 'normal' && highchartContent.showStackedTotal,
        // HC sets x or y := 0 by default, leaving no breathing space between the bar and the label
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
