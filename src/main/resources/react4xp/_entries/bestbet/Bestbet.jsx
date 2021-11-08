import React from 'react'
import PropTypes from 'prop-types'
import { Container, Row, Col } from 'react-bootstrap'
import { Title } from '@statisticsnorway/ssb-component-library'

function Bestbet(props) {
  return (
    <Container>
      <Row>
        <Col>
          <Title size={1}>Best-bet app</Title>
          {props.value}
        </Col>
      </Row>
    </Container>
  )
}

Bestbet.propTypes = {
  value: PropTypes.string
}

export default (props) => <Bestbet {...props} />

