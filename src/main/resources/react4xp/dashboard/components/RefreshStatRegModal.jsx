import React from 'react'
import { PropTypes } from 'prop-types'
import { Button, Modal } from 'react-bootstrap'

export function RefreshStatRegModal(props) {
  const {
    statReg,
    handleClose
  } = props
  const {
    displayName,
    logData
  } = statReg

  return (
    <Modal size="lg" show={true} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Oppdatering av {displayName}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {logData.showWarningIcon ? <p>Noe gikk galt</p> : <p>OK</p>}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
            Lukk
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

RefreshStatRegModal.propTypes = {
  statReg: PropTypes.object,
  handleClose: PropTypes.func
}
