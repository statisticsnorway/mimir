import React, { useState } from 'react'
import { Modal } from 'react-bootstrap'
import { AlertTriangle } from 'react-feather'
import PropTypes from 'prop-types'

function ConnectionTimeoutModal(props) {
  const { isConnected, serverTimeReceived } = props
  const [hide, setHide] = useState(false)

  // To prevent modal from opening during page render/reload, include serverTimeReceived check
  if (serverTimeReceived) {
    return (
      <Modal
        className='connection-timeout-modal'
        backdropClassName='connection-timeout-modal-backdrop'
        backdrop='static'
        size='lg'
        show={!isConnected && !hide}
        onHide={() => setHide(true)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <AlertTriangle size={60} />
            Tilkobling avbrutt.
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Last inn siden på nytt.</p>
        </Modal.Body>
      </Modal>
    )
  }
}

ConnectionTimeoutModal.propTypes = {
  isConnected: PropTypes.bool,
  serverTimeReceived: PropTypes.string,
}

export default ConnectionTimeoutModal
