import React, { useContext, useState } from 'react'
import PropTypes from 'prop-types'
import { useDispatch } from 'react-redux'
import { WebSocketContext } from '../../utils/websocket/WebsocketProvider'
import { Button, Modal } from 'react-bootstrap'
import { Check, X } from 'react-feather'
import { requestEventLogData } from './actions'

/* TODO:
*   Should only include the tbml ids that have been updated */

export function StatisticsLog(props) {
  const dispatch = useDispatch()
  const io = useContext(WebSocketContext)

  const {
    id,
    name,
    relatedTables,
    logData,
    loadingLogs,
    eventLogNodes
  } = props.statistics

  const [show, setShow] = useState(false)
  const handleClose = () => setShow(false)
  const handleShow = () => setShow(true)

  const openEventlog = () => {
    requestEventLogData(dispatch, io, id)
    setShow(handleShow)
  }

  function renderLogData() {
    if (logData) {
      return (
        <span className="d-flex justify-content-center text-center haveList">
          <span onClick={() => openEventlog()}>
            Oppdatert
            {logData.modified ? logData.modified : ''}
            {logData.by && logData.by.displayName ? `av ${logData.by.displayName}` : ''}
            {logData.showWarningIcon ? <span><X size="12" color="#FF4500"/></span> : <span><Check size="12" color="#1A9D49" /></span>}
          </span>
          {show ? <ModalContent/> : null}
        </span>
      )
    } else return <span className="d-flex justify-content-center text-center">Ingen logger</span>
  }

  function renderJobLogs() {
    if (loadingLogs === true) {
      return (
        <span className="spinner-border spinner-border"/>
      )
    } else {
      return eventLogNodes.map((logNode, index) => {
        return (
          <p key={index}>
            <span>{logNode.modifiedTs}</span> - <span>{logNode.by}</span><br/>
            <span> &gt; {relatedTables.length > 0 ? relatedTables.map(({
              tbmlId
            }) => tbmlId) : 'Ingen tabeller'}</span><br/>
          </p>
        )
      })
    }
  }

  const ModalContent = () => {
    return (
      <Modal
        show={show}
        onHide={handleClose}
        animation={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Logg detaljer
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h3>{name}</h3>
          {renderJobLogs()}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>Lukk</Button>
        </Modal.Footer>
      </Modal>
    )
  }

  return (
    renderLogData()
  )
}

StatisticsLog.propTypes = {
  statistics: PropTypes.object
}
