import React, { useState } from 'react'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import PropTypes from 'prop-types'
import { Row, Col, Container } from 'react-bootstrap'
import { Title, Button, Tabs, Divider, Link } from '@statisticsnorway/ssb-component-library'
import 'highcharts/modules/accessibility'
import 'highcharts/modules/exporting'
import 'highcharts/modules/offline-exporting'
import 'highcharts/modules/export-data'
import 'highcharts/modules/data'
import 'highcharts/modules/no-data-to-display'
import 'highcharts/modules/broken-axis'

import accessibilityLang from './../../../assets/js/highchart-lang.json'

/* TODO list
 * Display highcharts in edit mode
 * Show highcharts draft in content type edit mode button
 * Perfomance - highcharts react takes a bit longer to load
 * --- UU improvements ---
 * Show figure as highchart table functionality
 * Fix open xls exported file without dangerous file popup
 * Option to replace Category in highchart table row
 * Show last point symbol for line graphs
 * ...etc
 * --- Rest ---
 * Cleanup - are there any files and lines of code we can delete after full conversion?
 */
function Highchart(props) {
  const [showDraft, setShowDraft] = useState(false)
  const [showTable, setShowTable] = useState(false)

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

  function renderHighchartsSource(sourceLink, index) {
    return (
      <Row key={index}>
        <Col>
          <Link href={sourceLink.sourceHref}>
            {props.phrases.source}: {sourceLink.sourceText}
          </Link>
        </Col>
      </Row>
    )
  }

  function renderHighchartsFooter(highchart) {
    return (
      <Col>
        {highchart.footnoteText ? (
          <Row className='footnote mb-4 mb-md-5'>
            <Col>{highchart.footnoteText}</Col>
          </Row>
        ) : null}
        {highchart.creditsEnabled ? highchart.sourceList.map((source, i) => renderHighchartsSource(source, i)) : null}
      </Col>
    )
  }

  function renderHighcharts() {
    const highcharts = props.highcharts
    if (highcharts && highcharts.length) {
      return highcharts.map((highchart) => {
        const lang = language !== 'en' ? accessibilityLang.lang : {}

        const config = {
          ...highchart.config,
          lang: {
            ...lang,
            categoryHeader: highchart.xAxis.title.text ? highchart.xAxis.title.text : 'Category',
          },
          chart: {
            ...highchart.config.chart,
            events: {
              exportData: function (chart) {
                // Workaround to get correct number formatting in table in Norwegian
                if (language !== 'en') {
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
              },
              load: function () {
                // Drawing yAxis break symbol when y-axis not starting at 0
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
                      chart.yAxis[i].ticks[firstTickValue].label.xy.y ===
                      chart.yAxis[i].ticks[secondTickValue].label.xy.y
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
            {renderHighchartsFooter(highchart)}
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
      sourceList: Highchart['sourceList'],
      hideTitle: PropTypes.boolean,
    })
  ),
  phrases: PropTypes.object,
  appName: PropTypes.string,
  pageType: PropTypes.string,
}

export default (props) => <Highchart {...props} />
