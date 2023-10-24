import React from 'react'
import { Modal } from 'react-bootstrap'

function ConnectionTimeoutModal(props) {
  const { isConnected } = props

  // TODO: Ignore on page load; isConnected will return true the first few seconds
  return (
    <Modal size='lg' show={!isConnected} onHide={isConnected}>
      <Modal.Header></Modal.Header>
      <Modal.Body>Tilkobling avbrutt. Last siden på nytt.</Modal.Body>
      <Modal.Footer></Modal.Footer>
    </Modal>
  )
}

export default ConnectionTimeoutModal
