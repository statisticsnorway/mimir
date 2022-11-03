import React, { useState, useEffect } from 'react'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import PropTypes from 'prop-types'
import { Row, Col, Container } from 'react-bootstrap'
import { Title, Button, Tabs, Divider, Link } from '@statisticsnorway/ssb-component-library'
import { addGtagForEvent } from '../../../react4xp/ReactGA'

require('highcharts/modules/accessibility')(Highcharts)
require('highcharts/modules/exporting')(Highcharts)
require('highcharts/modules/export-data')(Highcharts)
require('highcharts/modules/data')(Highcharts)
require('highcharts/modules/no-data-to-display')(Highcharts)

/* TODO list
 * Display highcharts in edit mode
 * Show highcharts draft in content type edit mode button
 * Perfomance - highcharts react takes a bit longer to load
 * --- UU improvements ---
 * Show figure as highchart table functionality
 * Fix open xls exported file without dangerous file popup
 * Thousand seperator and decimal point corrections to highchart table
 * Option to replace Category in highchart table row
 * Show last point symbol for line graphs
 * ...etc
 * --- Rest ---
 * Cleanup - are there any files and lines of code we can delete after full conversion?
 */
function Highchart(props) {
  const [showDraft, setShowDraft] = useState(false)
  const [showTable, setShowTable] = useState(false)

  useEffect(() => {
    // Set options before highcharts react is rendered
    Highcharts.setOptions({
      lang: {
        accessibility: {
          chartContainerLabel: '{title} Interaktiv graf',
          exporting: {
            chartMenuLabel: 'Last ned graf',
            menuButtonLabel: 'Velg format for å laste ned {chartTitle}',
          },
          screenReaderSection: {
            beforeRegionLabel: 'Diagram skjermleser-informasjon for {chartTitle}.',
            endOfChartMarker: '',
          },
          legend: {
            legendItem: 'Vis {itemName}',
            legendLabel: 'Forklaring av diagram: {legendTitle}',
            legendLabelNoTitle: 'Bytt synlighet på serie, {chartTitle}',
          },
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
          unknownMap: 'Kart med {numSeries} dataserier.',
        },
        series: {
          xAxisDescription: 'X-akse, {name}',
          yAxisDescription: 'Y-akse , {name}',
          summary: {
            bar: '{name}, stolpediagram {ix} av {numSeries} med {numPoints} {#plural(numPoints, bars, bar)}.',
            barCombination:
              '{name}, serie {ix} av {numSeries}. stolpediagram med {numPoints} {#plural(numPoints, bars, bar)}.',
            boxplot: '{name}, boksdiagram {ix} av {numSeries} med {numPoints} {#plural(numPoints, boxes, box)}.',
            boxplotCombination:
              '{name}, serie {ix} av {numSeries}. Boksdiagram med {numPoints} {#plural(numPoints, boxes, box)}.',
            bubble: '{name}, boblediagram {ix} av {numSeries} med {numPoints} {#plural(numPoints, bubbles, bubble)}.',
            bubbleCombination:
              '{name}, serie {ix} av {numSeries}. Boblediagram serie med {numPoints} {#plural(numPoints, bubbles, bubble)}.',
            column: '{name}, stolpediagram {ix} av {numSeries} med {numPoints} {#plural(numPoints, bars, bar)}.',
            columnCombination:
              '{name}, serie {ix} av {numSeries}. Stolpediagram med {numPoints} {#plural(numPoints, bars, bar)}.',
            default: '{name}, serie {ix} av {numSeries} med {numPoints} data {#plural(numPoints, points, point)}.',
            defaultCombination:
              '{name}, serie {ix} av {numSeries} med {numPoints} data {#plural(numPoints, points, point)}.',
            line: '{name}, linje {ix} av {numSeries} med {numPoints} data {#plural(numPoints, points, point)}.',
            lineCombination:
              '{name}, serie {ix} av {numSeries}. Linje med {numPoints} data {#plural(numPoints, points, point)}.',
            map: '{name}, kart {ix} av {numSeries} med {numPoints} {#plural(numPoints, areas, area)}.',
            mapbubble:
              '{name}, Boblediagram {ix} av {numSeries} med {numPoints} {#plural(numPoints, bubbles, bubble)}.',
            mapbubbleCombination:
              '{name}, serie {ix} av {numSeries}. Boblediagram serie med {numPoints} {#plural(numPoints, bubbles, bubble)}.',
            mapCombination:
              '{name}, serie {ix} av {numSeries}. Kart med {numPoints} {#plural(numPoints, areas, area)}.',
            mapline: '{name}, linje {ix} av {numSeries} med {numPoints} data {#plural(numPoints, points, point)}.',
            maplineCombination:
              '{name}, serie {ix} av {numSeries}. Linje med {numPoints} data {#plural(numPoints, points, point)}.',
            pie: '{name}, Kake {ix} av {numSeries} med {numPoints} {#plural(numPoints, slices, slice)}.',
            pieCombination:
              '{name}, serie {ix} av {numSeries}. Kake med {numPoints} {#plural(numPoints, slices, slice)}.',
            scatter: '{name}, spredningsplott {ix} av {numSeries} med {numPoints} {#plural(numPoints, points, point)}.',
            scatterCombination:
              '{name}, serie {ix} av {numSeries}, spredningsplott med {numPoints} {#plural(numPoints, points, point)}.',
            spline: '{name}, linje {ix} av {numSeries} med {numPoints} data {#plural(numPoints, points, point)}.',
            splineCombination:
              '{name}, serie {ix} av {numSeries}. Linje med {numPoints} data {#plural(numPoints, points, point)}.',
          },
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
        thousandsSep: ' ',
      },
    })
  }, [])

  function renderHighchartToggleDraft(highchart) {
    // TODO: Reimplement functionality; currently only changes name on button
    if (props.pageType === `${props.appName}:highchart`) {
      return (
        <Col className='col-12 mb-3'>
          {highchart.config.draft && (
            <div className='alert alert-info mb-4' role='alert'>
              Tallet i figuren nedenfor er upublisert
            </div>
          )}
          {highchart.config.noDraftAvailable && (
            <div className='alert alert-warning mb-4' role='alert'>
              Det finnes ingen upubliserte tall for denne figuren
            </div>
          )}
          {!showDraft && (
            <Button primary onClick={() => setShowDraft(true)}>
              Vis upubliserte tall
            </Button>
          )}
          {showDraft && (
            <Button primary onClick={() => setShowDraft(false)}>
              Vis publiserte tall
            </Button>
          )}
        </Col>
      )
    }
  }

  function handleHighchartsTabOnClick(item) {
    if (item === 'highcharts-table/') {
      setShowTable(true)
    }

    if (item === 'highcharts-figure/') {
      setShowTable(false)
    }
  }

  function renderHighchartsTab() {
    return (
      <Col className='col-12 mb-3'>
        <Tabs
          className='pl-4'
          activeOnInit='highcharts-figure/'
          items={[
            {
              title: props.phrases['highcharts.showAsGraph'],
              path: 'highcharts-figure/',
            },
            {
              title: props.phrases['highcharts.showAsTable'],
              path: 'highcharts-table/',
            },
          ]}
          onClick={handleHighchartsTabOnClick}
        />
        <Divider light={false} className='mb-3' />
      </Col>
    )
  }

  function renderHighchartsSources(highchart) {
    return (
      <Col className='col-12'>
        {highchart.footnoteText ? <Row className='col-12 footnote'>{highchart.footnoteText}</Row> : null}
        {highchart.creditsEnabled ? (
          <Row className='mt-4 mt-md-5 highcharts-source'>
            <Col className='col-12 fw-bold mb-0'>{props.phrases.source}:</Col>
            <Col className='col-12'>
              <Link href={highchart.creditsHref}>{highchart.creditsText}</Link>
            </Col>
          </Row>
        ) : null}
      </Col>
    )
  }

  function renderHighcharts() {
    const highcharts = props.highcharts
    if (highcharts && highcharts.length) {
      return highcharts.map((highchart) => {
        const category = 'Highcharts'
        const action = 'Lastet ned highcharts'

        const config = {
          ...highchart.config,
          exporting: {
            ...highchart.config.exporting,
            showTable: showTable,
            menuItemDefinitions: {
              printChart: {
                text: props.phrases['highcharts.printChart'],
                onclick: function () {
                  const label = `${highchart.config.title.text} - Skriv ut graf`
                  if (props.GA_TRACKING_ID) {
                    addGtagForEvent(props.GA_TRACKING_ID, action, category, label)
                  }

                  this.print()
                },
              },
              downloadPNG: {
                text: props.phrases['highcharts.downloadPNG'],
                onclick: function () {
                  const label = `${highchart.config.title.text} - Last ned som PNG`
                  if (props.GA_TRACKING_ID) {
                    addGtagForEvent(props.GA_TRACKING_ID, action, category, label)
                  }

                  this.exportChart({
                    type: 'png',
                  })
                },
              },
              downloadJPEG: {
                text: props.phrases['highcharts.downloadJPEG'],
                onclick: function () {
                  const label = `${highchart.config.title.text} - Last ned som JPEG`
                  if (props.GA_TRACKING_ID) {
                    addGtagForEvent(props.GA_TRACKING_ID, action, category, label)
                  }

                  this.exportChart({
                    type: 'jpeg',
                  })
                },
              },
              downloadPDF: {
                text: props.phrases['highcharts.downloadPDF'],
                onclick: function () {
                  const label = `${highchart.config.title.text} - Last ned som PDF`
                  if (props.GA_TRACKING_ID) {
                    addGtagForEvent(props.GA_TRACKING_ID, action, category, label)
                  }

                  this.exportChart({
                    type: 'application/pdf',
                  })
                },
              },
              downloadSVG: {
                text: props.phrases['highcharts.downloadSVG'],
                onclick: function () {
                  const label = `${highchart.config.title.text} - Last ned som SVG`
                  if (props.GA_TRACKING_ID) {
                    addGtagForEvent(props.GA_TRACKING_ID, action, category, label)
                  }

                  this.exportChart({
                    type: 'svg',
                  })
                },
              },
              downloadXLS: {
                text: props.phrases['highcharts.downloadXLS'],

                onclick: function () {
                  const label = `${highchart.config.title.text} - Last ned som XLS`
                  if (props.GA_TRACKING_ID) {
                    addGtagForEvent(props.GA_TRACKING_ID, action, category, label)
                  }

                  // TODO: Re-implement zipcelx fix (are there other alternatives for react?)
                  this.downloadXLS()
                },
              },
              downloadCSV: {
                text: props.phrases['highcharts.downloadCSV'],
                onclick: function () {
                  const label = `${highchart.config.title.text} - Last ned som CSV`
                  if (props.GA_TRACKING_ID) {
                    addGtagForEvent(props.GA_TRACKING_ID, action, category, label)
                  }

                  this.downloadCSV()
                },
              },
            },
          },
        }

        return (
          <Row key={`highchart-${highchart.contentKey}`}>
            {renderHighchartToggleDraft(highchart)}
            <Col className='col-12'>
              <Title size={3}>{config.title.text}</Title>
              {config.subtitle.text ? <p className='highchart-subtitle mb-1'>{config.subtitle.text}</p> : null}
            </Col>
            {renderHighchartsTab()}
            <Col className='col-12'>
              <HighchartsReact highcharts={Highcharts} options={config} />
            </Col>
            {renderHighchartsSources(highchart)}
          </Row>
        )
      })
    }
  }

  return <Container>{renderHighcharts()}</Container>
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
      hideTitle: PropTypes.boolean,
    })
  ),
  phrases: PropTypes.object,
  appName: PropTypes.string,
  pageType: PropTypes.string,
  GA_TRACKING_ID: PropTypes.string,
}

export default (props) => <Highchart {...props} />
