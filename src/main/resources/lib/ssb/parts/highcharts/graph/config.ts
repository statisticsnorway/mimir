/* eslint-disable complexity */
// @ts-nocheck

import { localize } from '/lib/xp/i18n'
import { isEnabled } from '/lib/featureToggle'
import { ensureArray } from '/lib/ssb/utils/arrayUtils'

export const style = {
  color: '#21383a',
  fontSize: '13px',
  fontWeight: 'normal',
  fontFamily: '"Open Sans Regular", "Arial", "DejaVu Sans", sans-serif',
}
export const lineColor = '#21383a'

// retain the offset, but move it outs of the labels-zone
export const Y_AXIS_TITLE_POSITION = {
  align: 'high',
  rotation: 0,
  y: -15,
}

// keep the title at the end, but leave it to HC to compute offset & y-position
export const X_AXIS_TITLE_POSITION = {
  align: 'high',
  offset: undefined,
  y: undefined,
}
/**
 *
 * @param {object} highchartData
 * @param {string} displayName
 * @param {string} language
 * @return {object} config
 */
export const createDefaultConfig = (highchartData, displayName, language) => ({
  accessibility: {
    enabled: true,
    description: highchartData.description,
    screenReaderSection: {
      // eslint-disable-next-line max-len
      beforeChartFormat:
        '<div>{chartLongdesc}</div><div>{typeDescription}</div><div>{playAsSoundButton}</div><div>{xAxisDescription}</div><div>{yAxisDescription}</div><div>{annotationsTitle}{annotationsList}</div>',
    },
  },
  chart: {
    height: highchartData.heightAspectRatio > 0 ? `${highchartData.heightAspectRatio}%` : null,
    plotBorderColor: '#e6e6e6',
    spacingBottom: 18,
    plotBorderWidth: 0,
    style: {
      fontFamily: '"Open Sans Regular", "Arial", "DejaVu Sans", sans-serif',
      fontSize: '14px',
    },
    type: 'bar',
    spacing: [0, 10, 0, 0],
    zoomType: highchartData.zoomType,
    marginTop: 50,
  },
  // SSB color palette:
  colors: [
    '#1A9D49',
    '#274247',
    '#1D9DE2',
    '#0F2080',
    '#C78800',
    '#471F00',
    '#C775A7',
    '#A3136C',
    '#909090',
    '#000000',
  ],
  credits: {
    enabled: !!highchartData.sourceList,
  },
  exporting: {
    chartOptions: {
      chart: {
        spacingBottom: 10 + ensureArray(highchartData?.sourceList).length * 20,
      },
      xAxis: {
        labels: {
          step: 1,
        },
      },
      credits: {
        enabled: !!highchartData.sourceList,
        text: ensureArray(highchartData?.sourceList).reduce((combinedSources, currentSource) => {
          return (
            combinedSources +
            `<b style="color:#274247">${localize({
              key: 'source',
              locale: language ?? 'nb',
            })}: </b>${currentSource.sourceText}</br>`
          )
        }, ''),
        position: {
          align: 'left',
          x: 10,
          y: -10 - (ensureArray(highchartData?.sourceList).length - 1) * 20,
        },
        style: {
          color: '#00824d',
          fontSize: '16px',
        },
      },
    },
    buttons: {
      contextButton: {
        symbol: 'menu',
        symbolStroke: '#00824D', // ssb-green-4
        text: localize({
          key: 'highcharts.download',
          locale: language ? language : 'nb',
        }),
        menuItems: [
          'printChart',
          'separator',
          'downloadPNG',
          'downloadJPEG',
          'downloadPDF',
          'downloadSVG',
          'separator',
          'downloadCSV',
          'downloadXLS',
        ],
        y: 5,
      },
    },
    csv: {
      itemDelimiter: ';',
    },
    // Sett denne til false når man vil erstatte hamburgermeny med egen
    enabled: true,
    showTable: true,
  },
  legend: {
    enabled: !highchartData.noLegend,
    align: highchartData.legendAlign === 'right' ? 'right' : 'center',
    verticalAlign: highchartData.legendAlign == 'right' || highchartData.legendAlign == 'top' ? 'top' : 'bottom',
    layout: highchartData.legendAlign == 'right' ? 'vertical' : 'horizontal',
    x: highchartData.legendAlign == 'right' ? 10 : 0,
    y: highchartData.legendAlign == 'right' ? 65 : 0,
    itemMarginBottom: highchartData.legendAlign == 'right' ? 25 : 0,
    itemWidth: highchartData.legendAlign == 'right' ? 95 : null,
    itemStyle: {
      color: '#21383a',
      fontSize: '12px',
      fontWeight: 'normal',
    },
    width: highchartData.legendAlign == 'top' ? '75%' : 'auto',
    useHTML: true,
  },
  plotOptions: {
    pie: {
      allowPointSelect: true,
      minSize: 250,
      dataLabels: {
        enabled: !highchartData.pieLegend,
        style: {
          width: '150px',
        },
      },
      showInLegend: highchartData.pieLegend,
    },
    line: {
      marker: {
        enabled: true,
      },
    },
    series: {
      marker: {
        enabledThreshold: 15,
      },
      label: {
        enabled: true,
      },
      stacking:
        highchartData.stacking == 'normal' || highchartData.stacking == 'percent' ? highchartData.stacking : null,
      states: {
        hover: {
          // Since marker: enabled has been set to false, lineWidth needs to be thicker than the default 2 in order to improve accessibility
          lineWidth: 4,
        },
      },
    },
  },
  subtitle: {
    align: highchartData.titleCenter ? 'center' : 'left',
    style: {
      color: '#333',
      fontSize: '14px',
    },
    text: highchartData.subtitle,
    x: 0,
    y: 38,
  },
  title: {
    align: highchartData.titleCenter ? 'center' : 'left',
    style: {
      fontSize: '16px',
      fontWeight: 'bold',
    },
    margin: 40,
    text: displayName,
    x: 0,
    y: 18,
    widthAdjust: -150 - (highchartData.titleCenter == 'center' ? 90 : 0),
  },

  yAxis: {
    reversed: false,
    allowDecimals: highchartData.yAxisDecimalPlaces > 0,
    labels: {
      style,
      format: `{value:,.${highchartData.yAxisDecimalPlaces || 0}f}`,
    },
    max: highchartData.yAxisMax ? parseFloat(highchartData.yAxisMax.replace(/,/g, '.')) : null,
    min: highchartData.yAxisMin ? parseFloat(highchartData.yAxisMin.replace(/,/g, '.')) : null,
    stackLabels: {
      enabled: false,
      // HC sets x or y := 0 by default, leaving no breathing space between the bar and the label
      x: 0,
      y: 0,
    },
    tickWidth: 1,
    tickColor: '#21383a',
    lineWidth: 1,
    lineColor,
    title: {
      style,
      text: highchartData.yAxisTitle || '',
      offset: highchartData.yAxisOffset ? parseFloat(highchartData.yAxisOffset) : 0,
      ...Y_AXIS_TITLE_POSITION,
    },
    type: highchartData.yAxisType || 'linear',
  },
  xAxis: {
    reversed: highchartData.xAxisFlip == true ? true : false,
    title: {
      style,
      text: highchartData.xAxisTitle || '',
      ...X_AXIS_TITLE_POSITION,
    },
    lineColor,
    tickInterval: highchartData.tickInterval ? parseFloat(highchartData.tickInterval.replace(/,/g, '.')) : '',
    labels: {
      enabled: highchartData.showLabels,
      style,
    },
    max: highchartData.xAxisMax ? highchartData.xAxisMax.replace(/,/g, '.') : null,
    min: highchartData.xAxisMin ? highchartData.xAxisMin.replace(/,/g, '.') : null,
    tickmarkPlacement: 'on',
    type: highchartData.xAxisType || 'categories',
    tickWidth: 1,
    tickColor: '#21383a',
  },
  tooltip: {
    shadow: false,
    backgroundColor: 'white',
    valueDecimals: highchartData.numberDecimals,
    shared: highchartData.combineInfo,
  },
  noData: {
    style: {
      fontFamily: 'Roboto,sans-serif !important',
      fontStretch: 'normal',
      color: '#62919a',
      fontSize: '20px',
      fontWeight: '700',
    },
  },
  responsive: {
    rules: [
      {
        condition: {
          maxWidth: 450,
        },
        chartOptions: {
          chart: {
            height: '120%',
          },
          style: {
            fontSize: '10px',
          },
          title: {
            style: {
              fontSize: '12px',
            },
          },
          subTitle: {
            style: {
              fontSize: '10px',
            },
          },
          credits: {
            style: {
              fontSize: '12px',
            },
          },
          legend: {
            align: 'center',
            verticalAlign: 'bottom',
          },
          xAxis: {
            labels: {
              y: 25,
              style: {
                fontSize: '10px',
              },
            },
            title: {
              text: '',
            },
          },
          yAxis: {
            labels: {
              align: 'left',
              x: -10,
              y: -1,
              style: {
                fontSize: '10px',
              },
            },
            title: {
              text: isEnabled('highcharts-y-axix-title-mobile', true, 'ssb') ? highchartData.yAxisTitle : '',
            },
          },
        },
      },
    ],
  },
})
