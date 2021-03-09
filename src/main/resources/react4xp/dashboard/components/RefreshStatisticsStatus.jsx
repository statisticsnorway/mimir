import React from 'react'
import { Col, Row, Button } from 'react-bootstrap'
import PropTypes from 'prop-types'


export function RefreshStatisticsStatus(props) {
  const {
    modalDisplay,
    updateMessages
  } = props.modal

  return (
    <React.Fragment>
      <h2 className="mt-4">
        Oppdaterer { modalDisplay === 'loading' && <span className="spinner-border spinner-border-sm my-1" /> }
      </h2>
      {
        updateMessages.map((msg, i) => {
          return (
            <Row key={i} className="mb-3">
              <Col>{msg.name}</Col>
              <Col>
                {msg.status}
                <br />
                {msg.result}
              </Col>
            </Row>
          )
        })
      }
      {modalDisplay === 'complete' && <Button onClick={() => props.resetModal()}>Reset</Button>}
    </React.Fragment>
  )
}

RefreshStatisticsStatus.propTypes = {
  modal: PropTypes.object,
  resetModal: PropTypes.func
}

export default (props) => <RefreshStatisticsStatus {...props} />
