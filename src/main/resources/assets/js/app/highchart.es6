import $ from 'jquery'

import Highcharts from 'highcharts'
// Load the exporting module.
import highchartsModuleData from 'highcharts/modules/data'
import highchartsModuleAccessibility from 'highcharts/modules/accessibility'
import highchartsModuleExporting from 'highcharts/modules/exporting'
import highchartsModuleNoDataToDisplay from 'highcharts/modules/no-data-to-display'
import highchartsModuleExportData from 'highcharts/modules/export-data'
import zipcelx from 'zipcelx/lib/legacy'

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
    accessibility: {
      chartContainerLabel: '{title} Interaktiv graf',
      exporting: {
        chartMenuLabel: 'Last ned graf',
        menuButtonLabel: 'Velg format for å laste ned {chartTitle}'
      },
      screenReaderSection: {
        beforeRegionLabel: 'Diagram skjermleser-informasjon for {chartTitle}.',
        endOfChartMarker: ''
      },
      legend: {
        legendItem: 'Vis {itemName}',
        legendLabel: 'Forklaring av diagram: {legendTitle}',
        legendLabelNoTitle: 'Bytt synlighet på serie, {chartTitle}'
      }
    },
    chartTypes: {
      barMultiple: 'Søylediagram med {numSeries} serier.',
      barSingle: 'Søylediagram med {numPoints} {#plural(numPoints, bars, bar)}.',
      columnMultiple: 'Liggende søylediagram med {numSeries} linjer.',
      columnSingle: 'Søylediagram med {numPoints} {#plural(numPoints, bars, bar)}.',
      combinationChart: 'Kombinasjonsdiagram med {numSeries} dataserier.',
      defaultMultiple: 'Diagram med {numSeries} dataserier.',
      defaultSingle: 'Diagram med {numPoints} datapunkter {#plural(numPoints, points, point)}.',
      emptyChart: 'Tom datavisualisering',
      lineMultiple: 'Linjediagram med {numSeries} linjer.',
      lineSingle: 'Linjediagram med {numPoints} datapunkter {#plural(numPoints, points, point)}.',
      mapTypeDescription: 'Kart over {mapTitle} med {numSeries} dataserier.',
      pieMultiple: 'Kakediagram med {numSeries} kakestykker.',
      pieSingle: 'kakediagram med {numPoints} {#plural(numPoints, slices, slice)}.',
      scatterMultiple: 'Spredningsplott diagram med {numSeries} dataserier.',
      scatterSingle: 'Spredningsplott diagram med {numPoints} {#plural(numPoints, points, point)}.',
      splineMultiple: 'Linjediagram med {numSeries} linjer.',
      splineSingle: 'linjediagram med {numPoints} datapunkter {#plural(numPoints, points, point)}.',
      unknownMap: 'Kart med {numSeries} dataserier.'
    },
    series: {
      xAxisDescription: 'X-akse, {name}',
      yAxisDescription: 'Y-akse , {name}',
      summary: {
        bar: '{name}, stolpediagram {ix} av {numSeries} med {numPoints} {#plural(numPoints, bars, bar)}.',
        barCombination: '{name}, serie {ix} av {numSeries}. stolpediagram med {numPoints} {#plural(numPoints, bars, bar)}.',
        boxplot: '{name}, boksdiagram {ix} av {numSeries} med {numPoints} {#plural(numPoints, boxes, box)}.',
        boxplotCombination: '{name}, serie {ix} av {numSeries}. Boksdiagram med {numPoints} {#plural(numPoints, boxes, box)}.',
        bubble: '{name}, boblediagram {ix} av {numSeries} med {numPoints} {#plural(numPoints, bubbles, bubble)}.',
        bubbleCombination: '{name}, serie {ix} av {numSeries}. Boblediagram serie med {numPoints} {#plural(numPoints, bubbles, bubble)}.',
        column: '{name}, stolpediagram {ix} av {numSeries} med {numPoints} {#plural(numPoints, bars, bar)}.',
        columnCombination: '{name}, serie {ix} av {numSeries}. Stolpediagram med {numPoints} {#plural(numPoints, bars, bar)}.',
        default: '{name}, serie {ix} av {numSeries} med {numPoints} data {#plural(numPoints, points, point)}.',
        defaultCombination: '{name}, serie {ix} av {numSeries} med {numPoints} data {#plural(numPoints, points, point)}.',
        line: '{name}, linje {ix} av {numSeries} med {numPoints} data {#plural(numPoints, points, point)}.',
        lineCombination: '{name}, serie {ix} av {numSeries}. Linje med {numPoints} data {#plural(numPoints, points, point)}.',
        map: '{name}, kart {ix} av {numSeries} med {numPoints} {#plural(numPoints, areas, area)}.',
        mapbubble: '{name}, Boblediagram {ix} av {numSeries} med {numPoints} {#plural(numPoints, bubbles, bubble)}.',
        mapbubbleCombination: '{name}, serie {ix} av {numSeries}. Boblediagram serie med {numPoints} {#plural(numPoints, bubbles, bubble)}.',
        mapCombination: '{name}, serie {ix} av {numSeries}. Kart med {numPoints} {#plural(numPoints, areas, area)}.',
        mapline: '{name}, linje {ix} av {numSeries} med {numPoints} data {#plural(numPoints, points, point)}.',
        maplineCombination: '{name}, serie {ix} av {numSeries}. Linje med {numPoints} data {#plural(numPoints, points, point)}.',
        pie: '{name}, Kake {ix} av {numSeries} med {numPoints} {#plural(numPoints, slices, slice)}.',
        pieCombination: '{name}, serie {ix} av {numSeries}. Kake med {numPoints} {#plural(numPoints, slices, slice)}.',
        scatter: '{name}, spredningsplott {ix} av {numSeries} med {numPoints} {#plural(numPoints, points, point)}.',
        scatterCombination: '{name}, serie {ix} av {numSeries}, spredningsplott med {numPoints} {#plural(numPoints, points, point)}.',
        spline: '{name}, linje {ix} av {numSeries} med {numPoints} data {#plural(numPoints, points, point)}.',
        splineCombination: '{name}, serie {ix} av {numSeries}. Linje med {numPoints} data {#plural(numPoints, points, point)}.'
      }
    },
    svgContainerLabel: 'Interaktiv graf',
    defaultChartTitle: 'Graf',
    contextButtonTitle: 'Last ned/skriv ut',
    decimalPoint: ',',
    downloadJPEG: 'Last ned som JPEG',
    downloadPDF: 'Last ned som PDF',
    downloadPNG: 'Last ned som PNG',
    downloadSVG: 'Last ned som SVG',
    downloadCSV: 'Last ned tala som CSV',
    downloadXLS: 'Last ned tala som XLS',
    drillUpText: 'Tilbake til {series.name}',
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

        const category = 'Highcharts'
        const action = 'Lastet ned highcharts'

        config.exporting.menuItemDefinitions = {
          'printChart': {
            onclick: function() {
              const label = `${config.title.text} - Skriv ut graf`
              gtag('event', action, {
                'event_category': category,
                'event_label': label
              })

              this.print()
            }
          },
          'downloadPNG': {
            onclick: function() {
              const label = `${config.title.text} - Last ned som PNG`
              gtag('event', action, {
                'event_category': category,
                'event_label': label
              })

              this.exportChart({
                type: 'png'
              })
            }
          },
          'downloadJPEG': {
            onclick: function() {
              const label = `${config.title.text} - Last ned som JPEG`
              gtag('event', action, {
                'event_category': category,
                'event_label': label
              })

              this.exportChart({
                type: 'jpeg'
              })
            }
          },
          'downloadPDF': {
            onclick: function() {
              const label = `${config.title.text} - Last ned som PDF`
              gtag('event', action, {
                'event_category': category,
                'event_label': label
              })

              this.exportChart({
                type: 'application/pdf'
              })
            }
          },
          'downloadSVG': {
            onclick: function() {
              const label = `${config.title.text} - Last ned som SVG`
              gtag('event', action, {
                'event_category': category,
                'event_label': label
              })

              this.exportChart({
                type: 'svg'
              })
            }
          },
          'downloadXLS': {
            onclick: function() {
              const label = `${config.title.text} - Last ned som XLS`
              gtag('event', action, {
                'event_category': category,
                'event_label': label
              })
              const rows = this.getDataRows(true)
              const xlsxRows = rows.slice(1).map(function(row) {
                return row.map(function(column) {
                  return {
                    type: typeof column === 'number' ? 'number' : 'string',
                    value: column
                  }
                })
              })
              zipcelx({
                filename: config.title.text ? config.title.text : 'graf.xslt',
                sheet: {
                  data: xlsxRows
                }
              })
            }
          },
          'downloadCSV': {
            onclick: function() {
              const label = `${config.title.text} - Last ned som CSV`
              gtag('event', action, {
                'event_category': category,
                'event_label': label
              })

              this.downloadCSV()
            }
          }
        }

        Highcharts.chart(chart, config)
      }
    })
  })
}
