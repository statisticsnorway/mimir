import React from 'react'
import { useSelector } from 'react-redux'
import { PropTypes } from 'prop-types'
import { Button, Modal } from 'react-bootstrap'
import { selectStatRegStatus } from '../containers/StatRegDashboard/selectors'

export function RefreshStatRegModal(props) {
  const statReg = useSelector(selectStatRegStatus(props.statRegKey))

  function renderMessage(logData) {
    if (!statReg.loading) {
      if (logData.showWarningIcon) {
        return (
          <p>Noe gikk galt</p>
        )
      }
      return (
        <p>Alt gikk OK</p>
      )
    }
    return <span className="spinner-border spinner-border-sm" />
  }

  return (
    <Modal size="lg" show={true} onHide={props.handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Oppdatering av {statReg.displayName}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {renderMessage(statReg.logData)}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={props.handleClose}>
            Lukk
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

RefreshStatRegModal.propTypes = {
  statRegKey: PropTypes.string,
  handleClose: PropTypes.func
}
