import React, { useState } from 'react'
import { Modal } from 'react-bootstrap'
import { AlertTriangle } from 'react-feather'
import PropTypes from 'prop-types'

function ConnectionTimeoutModal(props) {
  const { isConnected } = props
  const [hide, setHide] = useState(false)

  if (isConnected !== undefined) {
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
}

export default ConnectionTimeoutModal
