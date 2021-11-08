import React from 'react'
import PropTypes from 'prop-types'
import { Container, Row, Col } from 'react-bootstrap'
import { Title } from '@statisticsnorway/ssb-component-library'

function Bestbet(props) {
  return (
    <Container>
      <Row className="bestbet-header">
        <Col>
          <img src={props.logoUrl} className="logo" />
          <Title size={1}>Best-bet søk</Title>
        </Col>
      </Row>
      <Row className="bestbet-list">
        <Col>
          {props.value}
        </Col>
      </Row>
    </Container>
  )
}

Bestbet.propTypes = {
  value: PropTypes.string,
  logoUrl: PropTypes.string
}

export default (props) => <Bestbet {...props} />

