import $ from 'jquery'

import Highcharts from 'highcharts'
// Load the exporting module.
import highchartsModuleData from 'highcharts/modules/data'
import highchartsModuleAccessibility from 'highcharts/modules/accessibility'
import highchartsModuleExporting from 'highcharts/modules/exporting'
import highchartsModuleNoDataToDisplay from 'highcharts/modules/no-data-to-display'
import highchartsModuleExportData from 'highcharts/modules/export-data'

// Initialize exporting module.
highchartsModuleData(Highcharts)
highchartsModuleAccessibility(Highcharts)
highchartsModuleExporting(Highcharts)
highchartsModuleNoDataToDisplay(Highcharts)
highchartsModuleExportData(Highcharts)

const EMPTY_CONFIG = {
  title: {
    style: {}
  },
  tooltip: {},
  plotOptions: {
    series: {}
  }
}

const createSetOptions = {
  lang: {
    contextButtonTitle: 'Last ned/skriv ut',
    decimalPoint: ',',
    downloadJPEG: 'Last ned som JPEG',
    downloadPDF: 'Last ned som PDF',
    downloadPNG: 'Last ned som PNG',
    downloadSVG: 'Last ned som SVG',
    downloadCSV: 'Last ned tala som CSV',
    downloadXLS: 'Last ned tala som XLS',
    drillUpText: 'Tilbake til',
    loading: 'Tegner graf...',
    noData: 'Tall ikke tilgjengelig',
    numericSymbols: [null, ' mill.', ' mrd.'],
    printChart: 'Skriv ut graf',
    resetZoom: 'Nullstill zoom',
    resetZoomTitle: 'Nullstill zoom',
    thousandsSep: ' '
  }
}

// HIGHCHART
export function init() {
  Highcharts.setOptions(createSetOptions)

  $(function() {
    const w = {
      height: $(window).height().toFixed(0),
      width: $(window).width().toFixed(0)
    }

    $('.btn-highchart-export').on('click', (e) => {
      $(e.target).parent().find(`.highcharts-a11y-proxy-button`)
        .first()
        .trigger('click')
    })

    $('.hc-container').each(function(i, container) {
      const height = $(container).height()
      $(container).find('svg').attr('height', height)
    })

    const h1Size = w.width < 768 ? '14px' : '16px'

    // Initialisering av HighCharts-figurer fra tilhørende HTML-tabell
    $('.highcharts-canvas[id^="highcharts-"]').each(function(index, chart) {
      const config = window['highchart' + $(chart).data('contentkey')] || EMPTY_CONFIG
      const canvas = $(chart)
      const highchartsContentKey = canvas.data('contentkey')

      // Bare kjør script hvis tabellen det skal hentes data fra, eksisterer på siden
      if ($('table#highcharts-datatable-' + highchartsContentKey)) {
        config.title.style.fontSize = h1Size

        if (canvas.data('type') === 'barNegative') {
          config.yAxis.labels.formatter = function(a) {
            return Math.abs(a.value)
          }
        }
        config.tooltip.formatter = (canvas.data('type') === 'barNegative') ? function() {
          return `<b>${this.series.name} ${this.point.category}:</b> ` + Highcharts.numberFormat(Math.abs(this.point.y), 0)
        } : ''

        if (canvas.data('type') === 'pie') {
          config.legend.labelFormatter = function name() {
            return Array.isArray(this.name) ? this.name[0] : this.name
          }
        }

        config.plotOptions.series.events = {
          legendItemClick: function(e) {
            // Possible bug: untested browser support for browserEvent (but works in IE8, chrome, FF...)
            $(e.browserEvent.target).toggleClass('disabled')
          }
        }

        $('button#show-tabledata-' + highchartsContentKey).on('click', (e) => {
          $('#figure-' + highchartsContentKey).find('.highcharts-data-table').show()
          $('#figure-' + highchartsContentKey).find('.highcharts-canvas').hide()
        })

        $('button#show-graph-' + highchartsContentKey).on('click', (e) => {
          $('#figure-' + highchartsContentKey).find('.highcharts-data-table').hide()
          $('#figure-' + highchartsContentKey).find('.highcharts-canvas').show()
        })

        Highcharts.chart(chart, config)
        $('.highcharts-data-table').hide()
      }
    })
  })
}
