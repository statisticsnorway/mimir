import React, { useState } from 'react'
import { Modal } from 'react-bootstrap'
import { RefreshCw, ZapOff } from 'react-feather'
import { Button } from '@statisticsnorway/ssb-component-library'
import PropTypes from 'prop-types'

function ConnectionTimeoutModal(props) {
  const { isConnected } = props
  const [hide, setHide] = useState(false)

  function handlePageRefresh() {
    location.reload(true)
  }

  if (isConnected !== undefined && !isConnected) {
    return (
      <Modal
        className='connection-timeout-modal'
        backdropClassName='connection-timeout-modal-backdrop'
        backdrop='static'
        size='lg'
        show={!hide}
        onHide={() => setHide(true)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <ZapOff size={40} />
            Siden er frakoblet
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Last inn siden på nytt.</p>
          <Button primary onClick={handlePageRefresh}>
            <RefreshCw size={18} />
          </Button>
        </Modal.Body>
      </Modal>
    )
  }
}

ConnectionTimeoutModal.propTypes = {
  isConnected: PropTypes.bool,
}

export default ConnectionTimeoutModal
