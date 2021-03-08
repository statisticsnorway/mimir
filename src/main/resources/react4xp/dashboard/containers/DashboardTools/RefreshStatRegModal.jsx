import React, { useContext } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { PropTypes } from 'prop-types'
import { Button, Modal } from 'react-bootstrap'
import { selectStatRegStatus } from '../StatRegDashboard/selectors'
import { requestStatRegEventLogData } from '../StatRegDashboard/actions'
import { WebSocketContext } from '../../utils/websocket/WebsocketProvider'

export function RefreshStatRegModal(props) {
  const io = useContext(WebSocketContext)
  const dispatch = useDispatch()

  const statReg = useSelector(selectStatRegStatus(props.statRegKey))
  const {
    displayName,
    eventLogNodes,
    logData,
    loading
  } = statReg

  function renderJobLogs() {
    requestStatRegEventLogData(dispatch, io, props.statRegKey)

    return eventLogNodes.map((logNode, index) => {
      return (
        <p key={index}>
          <span>{logNode.modifiedTs}</span> - <span>{logNode.by}</span><br/>
          <span> &gt; {logNode.result}</span>
        </p>
      )
    })
  }

  let statRegName
  if (displayName === 'statistikk') {
    statRegName = 'statistikker'
  } else {
    statRegName = displayName
  }

  function renderMessage(logData) {
    if (!loading) {
      if (logData.showWarningIcon) {
        return (
          <div>
            <span>
              Noe gikk galt med oppdatering av {statRegName}. Her er jobbloggen:
            </span>
            <div className="mt-4">
              {renderJobLogs()}
            </div>
          </div>
        )
      }
      return (
        <p>{statRegName.charAt(0).toUpperCase() + statRegName.slice(1)} ble oppdatert uten feil.</p>
      )
    }
    return <span className="spinner-border spinner-border-sm" />
  }

  return (
    <Modal size="lg" show={true} onHide={props.handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Oppdatering av {statRegName}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {renderMessage(logData)}
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
