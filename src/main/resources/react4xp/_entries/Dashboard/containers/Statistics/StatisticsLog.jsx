import React, { useContext, useState } from 'react'
import PropTypes from 'prop-types'
import { useDispatch, useSelector } from 'react-redux'
import { WebSocketContext } from '../../utils/websocket/WebsocketProvider'
import { Button, Modal } from 'react-bootstrap'
import { Check, X } from 'react-feather'
import { requestEventLogData } from '../DataQueries/actions'
import { selectDataQueriesById } from '../DataQueries/selectors'
import { Accordion } from '@statisticsnorway/ssb-component-library'

export function StatisticsLog(props) {
  const {
    statisticsShortName,
    relatedTables
  } = props

  const io = useContext(WebSocketContext)
  const dispatch = useDispatch()

  const dataQueries = relatedTables.map(({
    queryId
  }) => useSelector(selectDataQueriesById(queryId)))
    .sort((a, b) => {
      const aDate = a.logData && a.logData.modified ? new Date(a.logData.modified) : new Date('01.01.1970')
      const bDate = b.logData && b.logData.modified ? new Date(b.logData.modified) : new Date('01.01.1970')

      return aDate > bDate ? 1 : -1
    })

  const [show, setShow] = useState(false)
  const handleClose = () => setShow(false)
  const handleShow = () => setShow(true)

  const openEventlog = () => {
    dataQueries.map((dataQuery) => requestEventLogData(dispatch, io, dataQuery.id))
    setShow(handleShow)
  }

  function renderLogData() {
    if (dataQueries.length > 0) {
      const [firstDataQuery] = dataQueries
      if (firstDataQuery) {
        const {
          logData
        } = firstDataQuery
        if (logData) {
          return (
            <span className="d-sm-flex justify-content-center text-center small haveList">
              <span onClick={() => openEventlog()}>
                Oppdatert&nbsp;
                {logData.modified ? logData.modified : ''}
                {logData.by && logData.by.displayName ? ` av ${logData.by.displayName}` : ''}
                {logData.showWarningIcon ? <span><X size="14" color="#FF4500"/></span> : <span><Check size="14" color="#1A9D49" /></span>}
              </span>
              {show ? <ModalContent/> : null}
            </span>
          )
        }
      }
    }
    return <span className="d-sm-flex justify-content-center text-center small">Ingen logger</span>
  }

  function renderJobLogs() {
    return dataQueries.map((dataQuery, index) => {
      return (
        <Accordion
          key={index}
          className={dataQuery.logData && dataQuery.logData.showWarningIcon ? 'warning' : ''}
          header={dataQuery.displayName}
          subHeader={relatedTables[index].tbmlId}>
          {dataQuery.loadingLogs ?
            (<span className="spinner-border spinner-border" />) :
            (dataQuery.eventLogNodes.map((logNode, index) => {
              return (
                <p key={index}>
                  <span>{logNode.modifiedTs}</span> - <span>{logNode.by}</span><br/>
                  <span> &gt; {logNode.result}</span>
                </p>
              )
            }))
          }
        </Accordion>
      )
    }
    )
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
          <h3>{statisticsShortName}</h3>
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
  statisticsShortName: PropTypes.string,
  relatedTables: PropTypes.array
}
