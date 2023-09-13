import React, { useState, useEffect } from 'react'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import PropTypes from 'prop-types'
import { Row, Col, Container } from 'react-bootstrap'
import { Title, Button, Tabs, Divider, Link } from '@statisticsnorway/ssb-component-library'
import { addGtagForEvent } from '/react4xp/ReactGA'

import accessibilityLang from './../../../assets/js/highchart-lang.json'
import { ensureArray } from '/lib/ssb/utils/arrayUtils'

if (typeof Highcharts === 'object') {
  require('highcharts/modules/exporting')(Highcharts)
  require('highcharts/modules/export-data')(Highcharts)
  require('highcharts/modules/data')(Highcharts)
  require('highcharts/modules/no-data-to-display')(Highcharts)
  require('highcharts/modules/accessibility')(Highcharts)
}

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
    Highcharts.setOptions(accessibilityLang)
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

  function renderHighchartsSource(sourceLink) {
    return (
      <Row>
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
        {highchart.creditsEnabled
          ? ensureArray(highchart.sourceList).map((source) => renderHighchartsSource(source))
          : null}
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
          ...accessibilityLang,
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
  GA_TRACKING_ID: PropTypes.string,
}

export default (props) => <Highchart {...props} />
