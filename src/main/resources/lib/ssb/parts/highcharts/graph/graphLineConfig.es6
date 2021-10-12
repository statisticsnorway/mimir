const {
  mergeDeepRight
} = __non_webpack_require__('/lib/vendor/ramda')
const {
  createDefaultConfig
} = __non_webpack_require__('/lib/ssb/parts/highcharts/graph/config')

export function lineConfig(highchartsContent, options) {
  const defaultConfig = createDefaultConfig(highchartsContent.data, highchartsContent.displayName, highchartsContent.language)
  const customConfig = {
    chart: {
      type: 'line'
    },
    yAxis: {
      stackLabels: {
        enabled: highchartsContent.stacking === 'normal' && highchartsContent.showStackedTotal,
        x: 0,
        y: -5
      }
    },
    tooltip: {
      crosshairs: {
        width: 1,
        color: '#9575ff',
        dashStyle: 'solid'
      }
    },
    xAxis: {
      labels: {
        enabled: true
      },
      categories: highchartsContent.data.switchRowsAndColumns || !options.isJsonStat ? options.categories : [highchartsContent.displayName],
      gridLineWidth: 0
    }
  }
  return mergeDeepRight(defaultConfig, customConfig)
}
