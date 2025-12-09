import React, { useEffect, useState, useRef } from 'react'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import PropTypes from 'prop-types'
import { Row, Col, Container } from 'react-bootstrap'
import { Button, Tabs, Divider, Link } from '@statisticsnorway/ssb-component-library'
import 'highcharts/modules/accessibility'
import 'highcharts/modules/exporting'
import 'highcharts/modules/offline-exporting'
import 'highcharts/modules/export-data'
import 'highcharts/modules/data'
import 'highcharts/modules/no-data-to-display'
import 'highcharts/modules/broken-axis'

import accessibilityLang from './../../../assets/js/highchart-lang.json'

/* TODO list
 * --- UU improvements ---
 * Option to replace Category in highchart table row
 * Show last point symbol for line graphs
 * ...etc
 * --- Rest ---
 * Cleanup - are there any files and lines of code we can delete after full conversion?
 */
function Highchart(props) {
  const { highcharts, language, phrases } = props
  const highchartsWrapperRefs = useRef({})

  useEffect(() => {
    if (highcharts?.length) {
      highcharts.forEach(({ contentKey }) => {
        const highchartWrapperElement = highchartsWrapperRefs.current[contentKey]?.children
        const [highchartElement, tableWrapperElement] = highchartWrapperElement ?? []
        const tableElement = tableWrapperElement?.children[0]

        tableWrapperElement?.classList.add('ssb-table-wrapper', 'd-none')
        tableElement?.classList.add('statistics', 'ssb-table')
        tableElement?.setAttribute('tabindex', '0') // Scrollable region must have keyboard access

        // Add Tab component accessibility tags for Highcharts and table
        highchartElement?.setAttribute('id', 'tabpanel-0-' + contentKey)
        highchartElement?.setAttribute('role', 'tabpanel')

        tableWrapperElement?.setAttribute('id', 'tabpanel-1-' + contentKey)
        tableWrapperElement?.setAttribute('role', 'tabpanel')
      })
    }
  }, [highcharts])

  const handleTabOnClick = (contentKey) => ((item) => {
    const showTable = item === 'show-as-table'

    const highchartWrapperElement = highchartsWrapperRefs.current[contentKey]?.children
    const [highchartElement, tableWrapperElement] = highchartWrapperElement ?? []

    tableWrapperElement?.classList.toggle('d-none', !showTable)
    tableWrapperElement?.setAttribute('aria-hidden', !showTable)
    highchartElement?.classList.toggle('d-none', showTable)
    highchartElement?.setAttribute('aria-hidden', showTable)
  })

  function renderShowAsFigureOrTableTab(highchartId) {
    return (
      <Col className='col-12 mb-3'>
        <Tabs
          id={highchartId}
          activeOnInit='show-as-chart'
          items={[
            { title: phrases['highcharts.showAsChart'], path: 'show-as-chart' },
            { title: phrases['highcharts.showAsTable'], path: 'show-as-table' },
          ]}
          onClick={handleTabOnClick(highchartId)}
        />
        <Divider className='mb-3' />
      </Col>
    )
  }

  function renderHighchartsSource(sourceLink, index) {
    return (
      <Row key={index}>
        <Col>
          <Link href={sourceLink.sourceHref}>
            {phrases.source}: {sourceLink.sourceText}
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

  const downloadAsXLSX = (title) =>
  function () {
    const rows = this.getDataRows(true)
    exportHighchartsToExcel({
      rows: rows.slice(1),
      fileName: title ? `${title}.xlsx` : 'graf.xlsx',
    })
  }

  function renderHighcharts() {
    if (highcharts?.length) {
      return highcharts.map((highchart) => {
        const lang = language !== 'en' ? accessibilityLang.lang : {
          locale: "en-GB"
        }

        const config = {
          ...highchart.config,
          lang: {
            ...lang,
            categoryHeader: highcharts.xAxis?.title?.text ? highchart.xAxis.title.text : 'Category',
          },
          chart: {
            ...highchart.config.chart,
            events: {
              // Workaround to get correct number formatting in table
              exportData: function (chart) {
                for (const row of chart.dataRows) {
                  // Escaping first vaule not to format category ie. year
                  for (const [i, cell] of row.entries()) {
                    if (i > 0 && typeof cell === 'number') {
                      row[i] = cell.toLocaleString(language === 'en' ? 'en-EN' : 'no-NO').replace('NaN', '')
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
          exporting: {
            ...highchart.config.exporting,
            menuItemDefinitions: {
              downloadXLS: {
                onclick: downloadAsXLSX(highchart.config.title?.text),
              },
            },
          },
          yAxis: {
            ...highchart.config.yAxis,
            reversedStacks: !(highchart.config.chart?.type === 'bar' || highchart.config.chart?.type === 'column'),
          },
        }

        return (
          <Row key={`highchart-${highchart.contentKey}`}>
            <Col className='col-12'>
              <figure id={`figure-${highchart.contentKey}`} className='highcharts-figure mb-0 hide-title'>
                <figcaption className='figure-title'>{config.title.text}</figcaption>
                {config.subtitle.text ? <p className='figure-subtitle'>{config.subtitle.text}</p> : null}
                {renderShowAsFigureOrTableTab(highchart.contentKey)}
                <div ref={(el) => highchartsWrapperRefs.current[highchart.contentKey] = el }>
                  <HighchartsReact highcharts={Highcharts} options={config} />
                </div>
              </figure>
              {renderHighchartsFooter(highchart)}
            </Col>
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
