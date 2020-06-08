
export const style = {
  color: '#21383a',
  fontSize: '13px',
  fontWeight: 'normal',
  fontFamily: '"Open Sans Regular", "Arial", "DejaVu Sans", sans-serif'
}
export const lineColor = '#21383a'

// retain the offset, but move it outs of the labels-zone
export const Y_AXIS_TITLE_POSITION = {
  align: 'high',
  offset: 0,
  rotation: 0,
  y: -15
}

// keep the title at the end, but leave it to HC to compute offset & y-position
export const X_AXIS_TITLE_POSITION = {
  align: 'high',
  offset: undefined,
  y: undefined
}

export const createConfig = (highchartData, displayName) => ({
  accessibility: {
    enabled: true,
    keyboardNavigation: {
      order: ['chartMenu']
    }
  },
  chart: {
    plotBorderColor: '#e6e6e6',
    spacingBottom: 18,
    plotBorderWidth: 0,
    style: {
      fontFamily: '"Open Sans Regular", "Arial", "DejaVu Sans", sans-serif',
      fontSize: '14px'
    },
    type: (highchartData.graphType == 'barNegative') ? 'bar' : highchartData.graphType,
    spacing: [0, 10, 0, 0],
    zoomType: highchartData.zoomType
  },
  // SSB color palette:
  colors: [
    '#1a9d49', '#274247', '#3396d2', '#f0e442', '#f26539', '#aee5c3', '#ed51c9', '#0094a3',
    '#e9b200', '#143f90', '#075745', '#4b7272', '#6d58a4', '#83c1e9', '#b59924'],
  credits: {
    position: {
      align: 'left',
      x: 10
    },
    text: highchartData.creditsText,
    href: highchartData.creditsHref,
    style: {
      color: '#00824d',
      fontSize: '16px'
    },
    enabled: ( highchartData.creditsText || highchartData.creditsHref )
  },
  exporting: {
    buttons: {
      contextButton: {
        height: 26,
        symbolX: 14.5,
        symbolY: 12.5,
        theme: {
          'fill': '#fff',
          'r': 3,
          'stroke-width': 1,
          'stroke': '#bbb'
        },
        x: 8,
        width: 28,
        menuItems: [
          'printChart',
          'separator',
          'downloadPNG',
          'downloadJPEG',
          'downloadPDF',
          'downloadSVG',
          'separator',
          'downloadCSV',
          'downloadXLS'
        ]
      }
    },
    csv: {
      itemDelimiter: ';'
    },
    // Sett denne til false når man vil erstatte hamburgermeny med egen
    enabled: true
  },
  legend: {
    enabled: !highchartData.noLegend,
    align: highchartData.legendAlign === 'right' ? 'right' : 'center',
    verticalAlign: (highchartData.legendAlign == 'right') ? 'top' : 'bottom',
    layout: (highchartData.legendAlign == 'right') ? 'vertical' : 'horizontal',
    x: (highchartData.legendAlign == 'right') ? 10 : 0,
    y: (highchartData.legendAlign == 'right') ? 65 : 0,
    itemMarginBottom: (highchartData.legendAlign == 'right') ? 25 : 0,
    itemWidth: (highchartData.legendAlign == 'right') ? 95 : null,
    itemStyle: {
      color: '#21383a',
      fontSize: '12px',
      fontWeight: 'normal'
    },
    useHTML: true
  },
  plotOptions: {
    pie: {
      allowPointSelect: true,
      minSize: 250,
      dataLabels: {
        enabled: !highchartData.pieLegend,
        style: {
          width: '150px'
        }
      },
      showInLegend: highchartData.pieLegend
    },
    series: {
      marker: {
        enabledThreshold: 15
      },
      label: {
        enabled: true
      },
      stacking: (highchartData.stacking == 'normal' || highchartData.stacking == 'percent') ? highchartData.stacking : null,
      states: {
        hover: {
          // Since marker: enabled has been set to false, lineWidth needs to be thicker than the default 2 in order to improve accessibility
          lineWidth: 4
        }
      }
    }
  },
  subtitle: {
    align: highchartData.titleCenter ? 'center' : 'left',
    style: {
      color: '#333',
      fontSize: '14px'
    },
    text: highchartData.subtitle,
    x: 0,
    y: 48
  },
  title: {
    align: highchartData.titleCenter ? 'center' : 'left',
    style: {
      fontSize: '16px',
      fontWeight: 'bold'
    },
    margin: 40,
    text: displayName,
    x: 0,
    y: 18,
    widthAdjust: -150 - (highchartData.titleCenter == 'center' ? 90 : 0)
  },

  yAxis: {
    reversed: false,
    allowDecimals: highchartData.yAxisAllowDecimal,
    labels: {
      style,
      format: `{value:,.${highchartData.yAxisDecimalPlaces || 0}f}`
    },
    max: highchartData.yAxisMax ? highchartData.yAxisMax.replace(/,/g, '.') : null,
    min: highchartData.yAxisMin ? highchartData.yAxisMin.replace(/,/g, '.') : null,
    stackLabels: {
      enabled: highchartData.stablesum
    },
    tickWidth: 1,
    tickColor: '#21383a',
    lineWidth: 1,
    lineColor,
    title: {
      style,
      text: highchartData.yAxisTitle || '',
      ...Y_AXIS_TITLE_POSITION
    },
    type: highchartData.yAxisType || 'linear'
  },
  xAxis: {
    title: {
      style,
      text: highchartData.xAxisTitle || '',
      ...X_AXIS_TITLE_POSITION
    },
    labels: {
      style,
    }
  },
  tooltip: {
    crosshairs: highchartData.graphType == 'line' && {
      width: 1,
      color: '#9575ff',
      dashStyle: 'solid'
    },
    shadow: false,
    backgroundColor: 'white',
    valueDecimals: highchartData.numberDecimals,
    shared: highchartData.combineInfo
  },
  noData: {
    style: {
      fontFamily: 'Roboto,sans-serif !important',
      fontStretch: 'normal',
      color: '#62919a',
      fontSize: '20px',
      fontWeight: '700'
    }
  }
})
