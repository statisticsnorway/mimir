const {
  createDefaultConfig
} = __non_webpack_require__('/lib/highcharts/config')

export function lineConfig(highchartsContent, categories, options) {
  return {
    ...createDefaultConfig(highchartsContent.data, highchartsContent.displayName),
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
      categories: highchartsContent.data.switchRowsAndColumns || !options.isJsonStat ? categories : [highchartsContent.displayName],
      gridLineWidth: 0,
    }
  }
}
