const {
  createDefaultConfig
} = __non_webpack_require__('/lib/highcharts/config')

export function columnConfig(highchartContent, categories, options){

  const config = {
    ...createDefaultConfig(highchartContent.data, highchartContent.displayName),
    chart: {
      type: 'column'
    },
    yAxis: {
      stackLabels: {
        enabled: highchartContent.stacking === 'normal' && highchartContent.showStackedTotal,
        // HC sets x or y := 0 by default, leaving no breathing space between the bar and the label
        x: 0,
        y: 0
      }
    },
    xaxis: {
      labels: {
        enable: highchartContent.data.switchRowsAndColumns || !options.isJsonStat
      },
      categories: highchartContent.data.switchRowsAndColumns || !options.isJsonStat ? categories : [highchartContent.displayName],
      tickmarkPlacement: 'between',
    }
  }

  return config
}
