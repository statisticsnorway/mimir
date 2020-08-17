const {
  createDefaultConfig
} = __non_webpack_require__('/lib/highcharts/config')

export function barConfig(highchartContent, categories, options) {
  const defaultConfig = createDefaultConfig(highchartContent.data, highchartContent.displayName)
  return {
    ...defaultConfig(highchartContent.data, highchartContent.displayName),
    chart: {
      type: 'column'
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
      labels: {
        enable: highchartContent.data.switchRowsAndColumns || !options.isJsonStat
      },
      categories: highchartContent.data.switchRowsAndColumns || !options.isJsonStat ? categories : [highchartContent.displayName],
      tickmarkPlacement: 'between',
    }
  }
}
