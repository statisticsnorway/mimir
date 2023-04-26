import $ from 'jquery'
// only used in part Highcharts when not doing react4xp render

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
    style: {},
  },
  tooltip: {},
  plotOptions: {
    series: {},
  },
}

const createSetOptions = {
  lang: {
    accessibility: {
      chartContainerLabel: 'Interaktiv figur',
      exporting: {
        chartMenuLabel: 'Last ned graf',
        menuButtonLabel: 'Velg format for å laste ned {chartTitle}',
      },
      screenReaderSection: {
        beforeRegionLabel: 'Skjermleser-informasjon for figur',
        endOfChartMarker: '',
      },
      legend: {
        legendItem: 'Vis {itemName}',
        legendLabel: 'Forklaring av diagram: {legendTitle}',
        legendLabelNoTitle: 'Bytt synlighet på serie, {chartTitle}',
      },
      chartTypes: {
        barMultiple: 'Stolpediagram med {numSeries} serier.',
        barSingle: 'Stolpediagram med {numPoints} {#plural(numPoints, stolper, stolpe)}.',
        columnMultiple: 'Liggende søylediagram med {numSeries} linjer.',
        columnSingle: 'Søylediagram med {numPoints} {#plural(numPoints, søyler, søyle)}.',
        combinationChart: 'Kombinasjonsdiagram med {numSeries} dataserier.',
        defaultMultiple: 'Diagram med {numSeries} dataserier.',
        defaultSingle: 'Diagram med {numPoints} datapunkter {#plural(numPoints, punkter, punkt)}.',
        emptyChart: 'Tom datavisualisering',
        lineMultiple: 'Linjediagram med {numSeries} linjer.',
        lineSingle: 'Linjediagram med {numPoints} datapunkter {#plural(numPoints, punkter, punkt)}.',
        mapTypeDescription: 'Kart over {mapTitle} med {numSeries} dataserier.',
        pieMultiple: 'Sektordiagram med {numSeries} sektorer.',
        pieSingle: 'Sektordiagram med {numPoints} {#plural(numPoints, sektorer, sektor)}.',
        scatterMultiple: 'Spredningsplott diagram med {numSeries} dataserier.',
        scatterSingle: 'Spredningsplott diagram med {numPoints} {#plural(numPoints, punkter, punkt)}.',
        splineMultiple: 'Linjediagram med {numSeries} linjer.',
        splineSingle: 'Linjediagram med {numPoints} datapunkter {#plural(numPoints, punkter, punkt)}.',
        unknownMap: 'Kart med {numSeries} dataserier.',
      },
      axis: {
        rangeFromTo: 'Dataene varierer fra {rangeFrom} til {rangeTo}.',
        xAxisDescriptionPlural: 'Figuren har {numAxes} X akse som viser {#each(names, -1), }og {names[-1]}.',
        xAxisDescriptionSingular: 'Figuren har 1 X akse som viser {names[0]}. {ranges[0]}',
        yAxisDescriptionPlural: 'Figuren har {numAxes} Y akse som viser {#each(names, -1), }og {names[-1]}.',
        yAxisDescriptionSingular: 'Figuren har 1 Y akse som viser {names[0]}. {ranges[0]}',
      },
      series: {
        xAxisDescription: 'X-akse, {name}',
        yAxisDescription: 'Y-akse , {name}',
        summary: {
          bar: '{name}, stolpediagram {ix} av {numSeries} med {numPoints} {#plural(numPoints, stolper, stolpe)}.',
          barCombination:
            '{name}, serie {ix} av {numSeries}. Stolpediagram med {numPoints} {#plural(numPoints, stolper, stolpe)}.',
          boxplot: '{name}, boksdiagram {ix} av {numSeries} med {numPoints} {#plural(numPoints, bokser, boks)}.',
          boxplotCombination:
            '{name}, serie {ix} av {numSeries}. Boksdiagram med {numPoints} {#plural(numPoints, bokser, boks)}.',
          bubble: '{name}, boblediagram {ix} av {numSeries} med {numPoints} {#plural(numPoints, bobler, boble)}.',
          bubbleCombination:
            '{name}, serie {ix} av {numSeries}. Boblediagram serie med {numPoints} {#plural(numPoints, bobler, boble)}.',
          column: '{name}, søylediagram {ix} av {numSeries} med {numPoints} {#plural(numPoints, søyler, søyle)}.',
          columnCombination:
            '{name}, serie {ix} av {numSeries}. Søylediagram med {numPoints} {#plural(numPoints, søyler, søyle)}.',
          default:
            '{name}, seriediagram {ix} av {numSeries} med {numPoints} data {#plural(numPoints, punkter, punkt)}.',
          defaultCombination:
            '{name}, serie {ix} av {numSeries} med {numPoints} data {#plural(numPoints, punkter, punkt)}.',
          line: '{name}, linjediagram {ix} av {numSeries} med {numPoints} data {#plural(numPoints, punkter, punkt)}.',
          lineCombination:
            '{name}, serie {ix} av {numSeries}. Linje med {numPoints} data {#plural(numPoints, punkter, punkt)}.',
          map: '{name}, kart {ix} av {numSeries} med {numPoints} {#plural(numPoints, områder, område)}.',
          mapbubble: '{name}, boblediagram {ix} av {numSeries} med {numPoints} {#plural(numPoints, bobler, boble)}.',
          mapbubbleCombination:
            '{name}, serie {ix} av {numSeries}. Boblediagram serie med {numPoints} {#plural(numPoints, bobler, boble)}.',
          mapCombination:
            '{name}, serie {ix} av {numSeries}. Kart med {numPoints} {#plural(numPoints, områder, område)}.',
          mapline: '{name}, linje {ix} av {numSeries} med {numPoints} data {#plural(numPoints, punkter, punkt)}.',
          maplineCombination:
            '{name}, serie {ix} av {numSeries}. Linje med {numPoints} data {#plural(numPoints, punkter, punkt)}.',
          pie: '{name}, sektordiagram {ix} av {numSeries} med {numPoints} {#plural(numPoints, sektorer, sektor)}.',
          pieCombination:
            '{name}, serie {ix} av {numSeries}. Sektordiagram med {numPoints} {#plural(numPoints, sektorer, sektor)}.',
          scatter: '{name}, spredningsplott {ix} av {numSeries} med {numPoints} {#plural(numPoints, punkter, punkt)}.',
          scatterCombination:
            '{name}, serie {ix} av {numSeries}, spredningsplott med {numPoints} {#plural(numPoints, punkter, punkt)}.',
          spline: '{name}, linje {ix} av {numSeries} med {numPoints} data {#plural(numPoints, punkter, punkt)}.',
          splineCombination:
            '{name}, serie {ix} av {numSeries}. Linje med {numPoints} data {#plural(numPoints, punkter, punkt)}.',
        },
      },
      credits: 'Diagramkreditter: {creditsStr}.',
      svgContainerLabel: 'Interaktiv graf',
      defaultChartTitle: 'Graf',
    },
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
    thousandsSep: ' ',
  },
}

// HIGHCHART
export function init() {
  Highcharts.setOptions(createSetOptions)

  const lang = $('html').attr('lang')

  // Workaround for table ascending/descending sort.
  // There is a feature request in github, so a config option to disable the feature is being implemented.
  Highcharts.addEvent(
    Highcharts.Chart,
    'afterViewData',
    function () {
      this.dataTableDiv2 = this.dataTableDiv
      this.dataTableDiv = null
    },
    {
      order: 0,
    }
  )
  Highcharts.addEvent(Highcharts.Chart, 'afterViewData', function () {
    this.dataTableDiv = this.dataTableDiv2
    this.dataTableDiv2 = null
  })

  Highcharts.addEvent(Highcharts.Chart, 'aftergetTableAST', function (e) {
    e.tree.children[2].children.forEach(function (row) {
      row.children.forEach(function (cell, i) {
        if (i !== 0) {
          const cellValue = parseFloat(cell.textContent)
            .toLocaleString(lang === 'en' ? 'en-EN' : 'no-NO')
            .replace('NaN', '')
          row.children[i].textContent = lang === 'en' ? cellValue.replace(/,/g, ' ') : cellValue
        }
      })
    })
  })

  $(function () {
    const w = {
      height: $(window).height().toFixed(0),
      width: $(window).width().toFixed(0),
    }

    $('.hc-container').each(function (i, container) {
      const height = $(container).height()
      $(container).find('svg').attr('height', height)
    })

    const h1Size = w.width < 768 ? '14px' : '16px'

    // Initialisering av HighCharts-figurer fra tilhørende HTML-tabell
    $('.highcharts-canvas[id^="highcharts-"]').each(function (index, chart) {
      const config = window['highchart' + $(chart).data('contentkey')] || EMPTY_CONFIG
      const canvas = $(chart)
      const highchartsContentKey = canvas.data('contentkey')

      // Bare kjør script hvis tabellen det skal hentes data fra, eksisterer på siden
      if ($('table#highcharts-datatable-' + highchartsContentKey)) {
        config.title.style.fontSize = h1Size

        if (canvas.data('type') === 'barNegative') {
          config.yAxis.labels.formatter = function (a) {
            return Math.abs(a.value)
          }
        }
        config.tooltip.formatter =
          canvas.data('type') === 'barNegative'
            ? function () {
                return (
                  `<b>${this.series.name} ${this.point.category}:</b> ` +
                  Highcharts.numberFormat(Math.abs(this.point.y), 0)
                )
              }
            : ''

        if (canvas.data('type') === 'pie') {
          config.legend.labelFormatter = function name() {
            return Array.isArray(this.name) ? this.name[0] : this.name
          }
        }

        config.plotOptions.series.events = {
          legendItemClick: function (e) {
            // Possible bug: untested browser support for browserEvent (but works in IE8, chrome, FF...)
            $(e.browserEvent.target).toggleClass('disabled')
          },
        }

        // Only show plotOption marker on last data element
        if (canvas.data('type') === 'line') {
          config.series.forEach(function (series) {
            const lastIndex = series.data.length - 1
            series.data.forEach(function (data, index) {
              series.data[index] = {
                y: parseFloat(data),
                marker: {
                  enabled: index === lastIndex,
                },
              }
            })
          })
        }

        const category = 'Highcharts'
        const action = 'Lastet ned highcharts'

        config.exporting.menuItemDefinitions = {
          printChart: {
            onclick: function () {
              const label = `${config.title.text} - Skriv ut graf`
              gtag('event', action, {
                event_category: category,
                event_label: label,
              })

              this.print()
            },
          },
          downloadPNG: {
            onclick: function () {
              const label = `${config.title.text} - Last ned som PNG`
              gtag('event', action, {
                event_category: category,
                event_label: label,
              })

              this.exportChart({
                type: 'png',
              })
            },
          },
          downloadJPEG: {
            onclick: function () {
              const label = `${config.title.text} - Last ned som JPEG`
              gtag('event', action, {
                event_category: category,
                event_label: label,
              })

              this.exportChart({
                type: 'jpeg',
              })
            },
          },
          downloadPDF: {
            onclick: function () {
              const label = `${config.title.text} - Last ned som PDF`
              gtag('event', action, {
                event_category: category,
                event_label: label,
              })

              this.exportChart({
                type: 'application/pdf',
              })
            },
          },
          downloadSVG: {
            onclick: function () {
              const label = `${config.title.text} - Last ned som SVG`
              gtag('event', action, {
                event_category: category,
                event_label: label,
              })

              this.exportChart({
                type: 'svg',
              })
            },
          },
          downloadXLS: {
            onclick: function () {
              const label = `${config.title.text} - Last ned som XLS`
              gtag('event', action, {
                event_category: category,
                event_label: label,
              })
              const rows = this.getDataRows(true)
              const xlsxRows = rows.slice(1).map(function (row) {
                return row.map(function (column) {
                  return {
                    type: typeof column === 'number' ? 'number' : 'string',
                    value: column,
                  }
                })
              })
              zipcelx({
                filename: config.title.text ? config.title.text : 'graf.xslt',
                sheet: {
                  data: xlsxRows,
                },
              })
            },
          },
          downloadCSV: {
            onclick: function () {
              const label = `${config.title.text} - Last ned som CSV`
              gtag('event', action, {
                event_category: category,
                event_label: label,
              })

              this.downloadCSV()
            },
          },
        }

        // Replace table header from Category with xAxis.title.text
        config.exporting.csv.columnHeaderFormatter = function (item) {
          if (!item || item instanceof Highcharts.Axis) {
            return config.xAxis.title.text ? config.xAxis.title.text : 'Category'
          } else {
            return item.name
          }
        }

        Highcharts.chart(chart, config)

        // Hide data table when highchart is loaded
        $('.highcharts-data-table').addClass('hide-div')
        $('.highcharts-data-table').find('table').addClass('statistics')

        const graph = $('#figure-' + highchartsContentKey + ' .highcharts-canvas')
        const dataTable = $('#figure-' + highchartsContentKey + ' .highcharts-data-table')
        const buttonShowDataTable = $('button#show-tabledata-' + highchartsContentKey)
        const buttonShowGraph = $('button#show-graph-' + highchartsContentKey)

        buttonShowGraph.attr('aria-controls', 'panel-1-' + highchartsContentKey)
        buttonShowGraph.attr('aria-selected', true)

        graph.attr('id', 'panel-1-' + highchartsContentKey)
        graph.attr('role', 'tabpanel')

        buttonShowDataTable.attr('aria-controls', 'panel-2-' + highchartsContentKey)
        buttonShowDataTable.attr('aria-selected', false)
        buttonShowDataTable.attr('id', 'tab-2-' + highchartsContentKey)

        dataTable.attr('id', 'panel-2-' + highchartsContentKey)
        dataTable.attr('role', 'tabpanel')
        dataTable.attr('aria-labelledby', 'tab-2-' + highchartsContentKey)

        buttonShowGraph.on('click', () => {
          buttonShowGraph.addClass('active')
          buttonShowDataTable.removeClass('active')
          buttonShowDataTable.attr('aria-selected', false)
          buttonShowGraph.attr('aria-selected', true)
          dataTable.removeClass('show-div')
          dataTable.addClass('hide-div')
          graph.addClass('show-div')
          graph.removeClass('hide-div')
          graph.attr('aria-hidden', 'false')
        })

        buttonShowDataTable.on('click', () => {
          buttonShowDataTable.addClass('active')
          buttonShowGraph.removeClass('active')
          buttonShowDataTable.attr('aria-selected', true)
          buttonShowGraph.attr('aria-selected', false)
          dataTable.removeClass('hide-div')
          dataTable.addClass('show-div')
          graph.removeClass('show-div')
          graph.addClass('hide-div')
          graph.attr('aria-hidden', 'true')
        })
      }
    })
  })
}

document.addEventListener('DOMContentLoaded', () => init(), false)
