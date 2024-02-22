import React from 'react'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import PropTypes from 'prop-types'
import { Row, Col, Container } from 'react-bootstrap'

import accessibilityLang from './../../../assets/js/highchart-lang.json'

if (typeof Highcharts === 'object') {
  require('highcharts/modules/exporting')(Highcharts)
  require('highcharts/modules/offline-exporting')(Highcharts)
  require('highcharts/modules/export-data')(Highcharts)
  require('highcharts/modules/data')(Highcharts)
  require('highcharts/modules/no-data-to-display')(Highcharts)
  require('highcharts/modules/accessibility')(Highcharts)
}

function Highchart(props) {
  const configProp = JSON.parse(props.config)

  const config = {
    ...configProp,
    ...accessibilityLang,
  }

  return (
    <Container>
      <Row>
        <Col className='col-12'>
          <HighchartsReact highcharts={Highcharts} options={config} />
        </Col>
      </Row>
    </Container>
  )
}

Highchart.propTypes = {
  config: PropTypes.object,
}

export default (props) => <Highchart {...props} />
