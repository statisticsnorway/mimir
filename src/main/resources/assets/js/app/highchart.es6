import $ from 'jquery'
// only used in part Highcharts when not doing react4xp render

import Highcharts from 'highcharts'
import 'highcharts/modules/data'
import 'highcharts/modules/accessibility'
import 'highcharts/modules/exporting'
import 'highcharts/modules/offline-exporting'
import 'highcharts/modules/no-data-to-display'
import 'highcharts/modules/export-data'
import 'highcharts/modules/broken-axis'
import zipcelx from 'zipcelx/lib/legacy'

import accessibilityLang from '../highchart-lang.json'

const EMPTY_CONFIG = {
  title: {
    style: {},
  },
  tooltip: {},
  plotOptions: {
    series: {},
  },
}

// HIGHCHART
export function init() {
  //Highchart language checker
  const lang = $('html').attr('lang')

  $(function () {
    const w = {
      height: $(window).height().toFixed(0),
      width: $(window).width().toFixed(0),
    }

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

        if (canvas.data('type') === 'bar' || canvas.data('type') === 'column') {
          config.yAxis.reversedStacks = false
        }

        config.plotOptions.series.events = {
          legendItemClick: function (e) {
            // Possible bug: untested browser support for browserEvent (but works in IE8, chrome, FF...)
            $(e.browserEvent.target).toggleClass('disabled')
          },
        }

        // Only show plotOption marker on last data element / single data point series
        if (canvas.data('type') === 'line') {
          config.series.forEach((series) => {
            const indices = series.data.map((element) => element !== null)
            const lastIndex = indices.lastIndexOf(true)

            series.data = series.data.map((data, index) => ({
              y: parseFloat(data),
              marker: {
                enabled: index === lastIndex,
              },
            }))
          })
        }
        config.lang = lang !== "en"? accessibilityLang.lang :{}
        config.exporting.menuItemDefinitions = {
           downloadXLS: {
            onclick: function () {
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
        }
        config.lang.exportData = {
          categoryHeader: config.xAxis.title.text ? config.xAxis.title.text : 'Category',
        }

        // Drawing yAxis break symbol when y-axis not starting at 0
        if (!config.chart.events) config.chart.events = {}
        config.chart.events.load = function () {
          const chart = this
          for (let i = 0; i < chart.yAxis.length; i++) {
            // Natively highcharts resolves y axis not starting on 0 either with breaks or setting yMin
            if (chart.yAxis[i].min > 0 || chart.yAxis[i].brokenAxis?.hasBreaks) {
              // Replace first tick label with 0 since showing below broken axis symbol (for yMin > 0)
              const yAxisConfig = Array.isArray(config.yAxis) ? config.yAxis[i] : config.yAxis
              const decimalsMatch = yAxisConfig.labels?.format[9] ?? 0
              const zeroFormatted = Highcharts.numberFormat(0, decimalsMatch)
              const firstTickValue = chart.yAxis[i].tickPositions[0]
              chart.yAxis[i].ticks[firstTickValue].label.attr({ text: zeroFormatted })

              // Removes first tick label if rendered on top of 0 (for broken axis)
              const secondTickValue = chart.yAxis[i].tickPositions[1]
              if (
                chart.yAxis[i].ticks[firstTickValue].label.xy.y === chart.yAxis[i].ticks[secondTickValue].label.xy.y
              ) {
                chart.yAxis[i].ticks[secondTickValue].label.hide()
              }

              // Determine position for broken axis symbol
              const offset = chart.yAxis[i].opposite ? chart.plotWidth : 0
              const x = chart.plotLeft + offset - 10
              const y = chart.plotTop + chart.plotHeight - 10

              // Draw broken axis symbol
              chart.renderer
                .path(['M', x, y, 'l', 20, -5])
                .attr({
                  'stroke-width': 1,
                  stroke: 'black',
                })
                .add()
              chart.renderer
                .path(['M', x, y + 5, 'l', 20, -5])
                .attr({
                  'stroke-width': 1,
                  stroke: 'black',
                })
                .add()
            }
          }
        }

        // Workaround to get correct decimalpoint in table in Norwegian
        config.chart.events.exportData = function (chart) {
          if (lang !== 'en') {
            const rows = chart.dataRows
            for (const row of chart.dataRows) {
              for (const [i, cell] of row.entries()) {
                if (typeof cell === 'number') {
                  // Convert thousand separator to space
                  row[i] = cell.toString().replace(',', ' ')
                  // Convert decimal point to comma
                  row[i] = cell.toString().replace('.', ',')
                }
              }
            }
          }
        }

        Highcharts.chart(chart, config)

        // Hide data table when highchart is loaded
        $('.highchart-wrapper .highcharts-data-table').addClass('hide-div ssb-table-wrapper')
        $('.highchart-wrapper .highcharts-data-table').find('table').addClass('statistics ssb-table')

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
