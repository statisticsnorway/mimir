import React from 'react'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import PropTypes from 'prop-types'
import { Row, Col, Container } from 'react-bootstrap'

import accessibilityLang from './../../../assets/js/highchart-lang.json'

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
  function renderHighcharts() {
    const configProp = JSON.parse(props.config)

    const config = {
      ...configProp,
      ...accessibilityLang,
    }

    return (
      <Row key={`highchart-1231231`}>
        <Col className='col-12'>
          <HighchartsReact highcharts={Highcharts} options={config} />
        </Col>
      </Row>
    )
  }

  return <Container>{renderHighcharts()}</Container>
}

Highchart.propTypes = {
  config: PropTypes.object,
}

export default (props) => <Highchart {...props} />
