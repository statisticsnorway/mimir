import React, { useContext } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Button } from '@statisticsnorway/ssb-component-library'
import { Modal } from 'react-bootstrap'
import { selectStatRegStatus } from '/react4xp/dashboard/containers/StatRegDashboard/selectors'
import { requestStatRegEventLogData } from '/react4xp/dashboard/containers/StatRegDashboard/actions'
import { WebSocketContext } from '/react4xp/dashboard/utils/websocket/WebsocketProvider'
import { AlertTriangle } from 'react-feather'

interface RefreshStatRegModalProps {
  statRegKey?: string;
  handleClose?(...args: unknown[]): unknown;
}

export function RefreshStatRegModal(props: RefreshStatRegModalProps) {
  const io = useContext(WebSocketContext)
  const dispatch = useDispatch()

  const statReg = useSelector(selectStatRegStatus(props.statRegKey))
  const { displayName, logData, eventLogNodes, loading } = statReg

  function renderJobLogs() {
    requestStatRegEventLogData(dispatch, io, props.statRegKey)
    return eventLogNodes.map((logNode, index) => {
      return (
        <p key={index}>
          <span>{logNode.modifiedTs}</span> - <span>{logNode.by}</span>
          <br />
          <span> &gt; {logNode.result}</span>
        </p>
      )
    })
  }

  function renderMessage() {
    if (loading) {
      return <span className='spinner-border spinner-border-sm' />
    } else {
      return (
        <div>
          {logData.message ? logData.message : ''}
          {logData.showWarningIcon ? (
            <span className='warningIcon'>
              <AlertTriangle size='12' color='#FF4500' />
              <br />
            </span>
          ) : (
            <br />
          )}
          {logData.modifiedReadable ? logData.modifiedReadable : ''}
          <br />
          {logData.modified ? logData.modified : ''}
          <br />
          {logData.by && logData.by.displayName ? `av ${logData.by.displayName}` : ''}
          {logData.showWarningIcon && <div className='mt-4'>{renderJobLogs()}</div>}
        </div>
      )
    }
  }

  const statRegName = displayName === 'statistikk' ? 'statistikker' : displayName
  return (
    <Modal size='lg' show={true} onHide={props.handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Oppdatering av {statRegName}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{renderMessage()}</Modal.Body>
      <Modal.Footer>
        <Button onClick={props.handleClose}>Lukk</Button>
      </Modal.Footer>
    </Modal>
  )
}
