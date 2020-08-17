const {
  createDefaultConfig
} = __non_webpack_require__('/lib/highcharts/config')

export function pieConfig(highchartsContent, categories, options) {
  return {
    ...createDefaultConfig(highchartsContent.data, highchartsContent.displayName),
    chart: {
      type: 'pie'
    },
    yAxis: {
      stackLabels: {
        enabled: false,
        x: 0,
        y: 0
      }
    }
  }
}
