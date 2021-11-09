import React from 'react'
import PropTypes from 'prop-types'
import { Container, Row, Col } from 'react-bootstrap'
import { Title, Link } from '@statisticsnorway/ssb-component-library'

function Bestbet(props) {
  function renderBestbetList() {
    // TODO: Return dynamically; done manually currently for testing purposes
    return (
      <Row className="bestbet-list">
        <Col className="col-12">
          <Title size={2}>Placeholder</Title>
        </Col>
        <Col className="col-12">
          <Link href="/">{props.value}</Link>
        </Col>
      </Row>
    )
  }

  return (
    <Container>
      <Row className="bestbet-header">
        <Col>
          <img src={props.logoUrl} className="logo" />
          <Title size={1}>Best-bet søk</Title>
        </Col>
      </Row>
      {renderBestbetList()}
    </Container>
  )
}

Bestbet.propTypes = {
  value: PropTypes.string,
  logoUrl: PropTypes.string
}

export default (props) => <Bestbet {...props} />

