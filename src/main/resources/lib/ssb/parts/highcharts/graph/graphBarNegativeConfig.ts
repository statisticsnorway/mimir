import { mergeDeepRight } from '/lib/vendor/ramda'
import {
  X_AXIS_TITLE_POSITION,
  Y_AXIS_TITLE_POSITION,
  createDefaultConfig,
  lineColor,
  style,
} from '/lib/ssb/parts/highcharts/graph/config'

export function barNegativeConfig(highchartContent, options) {
  const defaultConfig = createDefaultConfig(
    highchartContent.data,
    highchartContent.displayName,
    highchartContent.language
  )
  const customConfig = {
    chart: {
      type: 'bar',
    },
    yAxis: {
      title: {
        ...defaultConfig.yAxis.title,
        ...X_AXIS_TITLE_POSITION,
      },
      stackLabels: {
        enabled: highchartContent.stacking === 'normal',
        x: 5,
        y: 0,
      },
    },
    xAxis: {
      title: {
        ...defaultConfig.xAxis.title,
        ...Y_AXIS_TITLE_POSITION,
      },
      categories: options.categories,
      reversed: highchartContent.data.xAxisFlip == true ? true : false,
      labels: {
        enable: highchartContent.data.switchRowsAndColumns,
        step: 1,
        style,
      },
      lineColor,
      accessibility: {
        description: options.xAxisLabel ? options.xAxisLabel : undefined,
      },
    },
    responsive: {
      rules: [
        {
          chartOptions: {
            chart: {
              height: '120%',
            },
            // NOTE: on negative bar chart, xAxis is vertical and yAxis is horizontal, don't ask why.
            yAxis: {
              labels: {
                y: 20,
              },
            },
            xAxis: {
              labels: {
                y: 7,
              },
            },
          },
          condition: {
            maxWidth: 450,
          },
        },
      ],
    },
  }
  return mergeDeepRight(defaultConfig, customConfig)
}
