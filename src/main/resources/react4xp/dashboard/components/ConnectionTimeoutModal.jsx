import React from 'react'
import { Modal } from 'react-bootstrap'

function ConnectionTimeoutModal(props) {
  const { isConnected, serverTimeReceived } = props

  // To prevent modal from opening during page render/reload, include serverTimeReceived check
  if (serverTimeReceived) {
    return (
      <Modal size='lg' show={!isConnected} onHide={isConnected}>
        <Modal.Body>Tilkobling avbrutt. Last siden på nytt.</Modal.Body>
      </Modal>
    )
  }
}

export default ConnectionTimeoutModal
