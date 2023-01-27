import React, { useContext, useState } from 'react'
import PropTypes from 'prop-types'
import { Button, Modal } from 'react-bootstrap'
import { AlertTriangle } from 'react-feather'
import { requestEventLogData } from '/react4xp/dashboard/containers/DataSources/actions'
import { useDispatch, useSelector } from 'react-redux'
import { selectDataToolBoxBaseUrl } from '/react4xp/dashboard/containers/HomePage/selectors'
import { selectDataSourceById } from '/react4xp/dashboard/containers/DataSources/selectors'
import { WebSocketContext } from '/react4xp/dashboard/utils/websocket/WebsocketProvider'
import { selectStatRegStatus } from '/react4xp/dashboard/containers/StatRegDashboard/selectors'
import { requestStatRegEventLogData } from '/react4xp/dashboard/containers/StatRegDashboard/actions.es6'

export function DataSourceLog(props) {
  const { dataSourceId, isStatReg } = props
  const dispatch = useDispatch()
  const io = useContext(WebSocketContext)
  const dataToolBoxBaseUrl = useSelector(selectDataToolBoxBaseUrl)
  const dataSource = isStatReg
    ? useSelector(selectStatRegStatus(dataSourceId))
    : useSelector(selectDataSourceById(dataSourceId))
  const { displayName, logData, loadingLogs, eventLogNodes } = dataSource

  const [show, setShow] = useState(false)
  const handleClose = () => setShow(false)
  const handleShow = () => setShow(true)

  const openEventlog = () => {
    if (isStatReg) {
      requestStatRegEventLogData(dispatch, io, dataSourceId)
    } else {
      requestEventLogData(dispatch, io, dataSourceId)
    }
    setShow(handleShow)
  }

  const openToolBox = () => {
    window.open(dataToolBoxBaseUrl + dataSourceId)
  }

  function renderLogData() {
    if (logData) {
      return (
        <span className='d-flex justify-content-center text-center haveList'>
          <span onClick={() => openEventlog()}>
            {logData.message ? logData.message : ''}
            {logData.showWarningIcon && (
              <span className='warningIcon'>
                <AlertTriangle size='12' color='#FF4500' />
              </span>
            )}
            <br />
            {logData.modifiedReadable ? logData.modifiedReadable : ''}
            <br />
            {logData.modified ? logData.modified : ''}
            <br />
            {logData.by && logData.by.displayName ? `av ${logData.by.displayName}` : ''}
          </span>
          {show ? <ModalContent /> : null}
        </span>
      )
    } else return <span className='d-flex justify-content-center text-center'>no logs</span>
  }

  const ModalContent = () => {
    return (
      <Modal show={show} onHide={handleClose} animation={false}>
        <Modal.Header closeButton>
          <Modal.Title>Logg detaljer</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h3>{displayName}</h3>
          {renderJobLogs()}
        </Modal.Body>
        <Modal.Footer>
          <Button variant='info' onClick={openToolBox}>
            Datatoolbox
          </Button>
          <Button variant='secondary' onClick={handleClose}>
            Lukk
          </Button>
        </Modal.Footer>
      </Modal>
    )
  }

  function renderJobLogs() {
    if (loadingLogs === true) {
      return <span className='spinner-border spinner-border' />
    } else {
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
  }

  return renderLogData()
}

DataSourceLog.propTypes = {
  dataSourceId: PropTypes.string,
  isStatReg: PropTypes.bool,
}
