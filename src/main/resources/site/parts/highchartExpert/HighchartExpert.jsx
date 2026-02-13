import React from 'react'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import PropTypes from 'prop-types'
import { Row, Col, Container } from 'react-bootstrap'

import 'highcharts/modules/accessibility'
import 'highcharts/modules/exporting'
import 'highcharts/modules/offline-exporting'
import 'highcharts/modules/export-data'
import 'highcharts/modules/data'
import 'highcharts/modules/no-data-to-display'

import accessibilityLang from  '/lib/ssb/parts/highcharts/highchart-lang.json'

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
