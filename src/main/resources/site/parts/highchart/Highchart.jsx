import React, { useState, useEffect } from 'react'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import PropTypes from 'prop-types'
import { Button, Tabs } from '@statisticsnorway/ssb-component-library'

require('highcharts/modules/accessibility')(Highcharts)
require('highcharts/modules/exporting')(Highcharts)
require('highcharts/modules/export-data')(Highcharts)
require('highcharts/modules/data')(Highcharts)
require('highcharts/modules/no-data-to-display')(Highcharts)

function Highchart(props) {
  const [config, setConfig] = useState([])
  const [showTable, setShowTable] = useState(false)

  useEffect(() => {
    Highcharts.setOptions({
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
    })
  }, [])

  function renderHighcharts(highcharts) {
    if (highcharts && highcharts.length) {
      return highcharts.map((highchart, index) =>
        <React.Fragment
          key={`highchart-${index}`}
        >
          {/* TODO: Kilder */}
          <HighchartsReact
            highcharts={Highcharts}
            options={highchart.config}
          />
        </React.Fragment>
      )
    }
  }

  return (
    <React.Fragment>
      {/* TODO: Add border to tab */}
      <Tabs
        activeOnInit="highcharts-figure/"
        items={[
          {
            title: props.phrases['highcharts.showAsGraph'],
            path: 'highcharts-figure/',
            onClick: () => setShowTable(false)
          },
          {
            title: props.phrases['highcharts.showAsTable'],
            path: 'highcharts-table/',
            onClick: () => setShowTable(true)
          }
        ]}
      />
      {renderHighcharts(props.highcharts)}
    </React.Fragment>
  )
}

Highchart.propTypes = {
  highcharts: PropTypes.arrayOf(
    PropTypes.shape({
      config: PropTypes.object,
      description: PropTypes.string,
      type: PropTypes.string,
      contentKey: PropTypes.string,
      footnoteText: PropTypes.string,
      creditsEnabled: PropTypes.boolean,
      creditsHref: PropTypes.string,
      creditsText: PropTypes.string,
      hideTitle: PropTypes.boolean
    })
  ),
  phrases: PropTypes.object
}

export default (props) => <Highchart {...props}/>
