const {
  mergeDeepRight
} = __non_webpack_require__('/lib/vendor/ramda')
const {
  X_AXIS_TITLE_POSITION,
  Y_AXIS_TITLE_POSITION,
  createDefaultConfig,
  lineColor,
  style
} = __non_webpack_require__('/lib/ssb/parts/highcharts/graph/config')

export function barNegativeConfig(highchartContent, options) {
  const defaultConfig = createDefaultConfig(highchartContent.data, highchartContent.displayName, highchartContent.language)
  const customConfig = {
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
        x: 5,
        y: 0
      }
    },
    xAxis: {
      title: {
        ...defaultConfig.xAxis.title,
        ...Y_AXIS_TITLE_POSITION
      },
      categories: options.categories,
      reversed: (highchartContent.data.xAxisFlip == true ? true : false),
      labels: {
        enable: highchartContent.data.switchRowsAndColumns,
        step: 1,
        style
      },
      lineColor,
      accessibility: {
        description: options.xAxisLabel ? options.xAxisLabel : undefined
      }
    }
  }
  return mergeDeepRight(defaultConfig, customConfig)
}
