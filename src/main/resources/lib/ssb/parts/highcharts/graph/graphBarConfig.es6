const {
  mergeDeepRight
} = require('ramda')
const {
  X_AXIS_TITLE_POSITION,
  createDefaultConfig
} = __non_webpack_require__('/lib/ssb/parts/highcharts/graph/config')

export function barConfig(highchartContent, options) {
  const defaultConfig = createDefaultConfig(highchartContent.data, highchartContent.displayName)
  const customConfig = {
    ...defaultConfig,
    chart: {
      type: 'bar'
    },
    yAxis: {
      title: {
        ...defaultConfig.yAxis.title,
        ...X_AXIS_TITLE_POSITION
      },
      stackLabels: {
        enabled: highchartContent.stacking === 'normal' && highchartContent.showStackedTotal,
        // HC sets x or y := 0 by default, leaving no breathing space between the bar and the label
        x: 0,
        y: 0
      }
    },
    xAxis: {
      reversed: (highchartContent.data.xAxisFlip == true ? true : false),
      labels: {
        enable: highchartContent.data.switchRowsAndColumns || !options.isJsonStat
      },
      categories: highchartContent.data.switchRowsAndColumns || !options.isJsonStat ? options.categories : [highchartContent.displayName],
      tickmarkPlacement: 'between'
    }
  }
  return mergeDeepRight(defaultConfig, customConfig)
}
