import React from 'react';
import PropTypes from 'prop-types';
import { Col, Row } from 'react-bootstrap'


export function RefreshStatisticsStatus(props) {
  return(
    <>
      <h2>Oppdaterer </h2>
      {
          props.refreshMessages.map((msg, i) => {
            return <Row key={i}>
              <Col>{msg.name}</Col>
              <Col>{msg.status} {msg.result}</Col>
            </Row>
          })
      }
    </>
  )
}

RefreshStatisticsStatus.propTypes = {
  refreshMessages: PropTypes.array
}

export default (props) => <RefreshStatisticsStatus {...props} />
