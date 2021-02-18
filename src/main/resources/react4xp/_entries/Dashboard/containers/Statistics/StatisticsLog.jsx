import React, { useContext, useState } from 'react'
import PropTypes from 'prop-types'
import { useDispatch } from 'react-redux'
import { WebSocketContext } from '../../utils/websocket/WebsocketProvider'
import { Button, Modal } from 'react-bootstrap'
import { requestEventLogData } from '../DataSources/actions'
import { Accordion } from '@statisticsnorway/ssb-component-library'
import moment from 'moment/min/moment-with-locales'
import { groupBy } from 'ramda'

export function StatisticsLog(props) {
  const {
    statistic
  } = props

  const io = useContext(WebSocketContext)
  const dispatch = useDispatch()
  const [show, setShow] = useState(false)
  const handleClose = () => setShow(false)
  const handleShow = () => setShow(true)

  const openEventlog = () => {
    setShow(handleShow)
  }

  function renderLogData() {
    if (statistic.logData.length > 0) {
      const log = statistic.logData[0]
      const groupedDataSourceLogs = groupBy((log) => {
        return log.status
      })(log.result)
      return (
        <React.Fragment>
          <span className="d-sm-flex justify-content-center text-center small haveList" onClick={() => openEventlog()}>
            {log.message} - {moment(log.completionTime ? log.completionTime : log.startTime).locale('nb').format('DD.MM.YYYY HH.mm')}
            <br/>
            {log.user ? log.user.displayName : ''}
            <br/>
            {Object.entries(groupedDataSourceLogs).map(([status, dataSourceLogGroup]) => renderDataSourceLogGroup(log, status, dataSourceLogGroup))}
          </span>
          {show ? <ModalContent/> : null}
        </React.Fragment>
      )
    }
    return <span className="d-sm-flex justify-content-center text-center small">Ingen logger</span>
  }

  function renderDataSourceLogGroup(log, status, dataSourceLogGroup) {
    const tbmls = dataSourceLogGroup.map((datasource) => {
      const relatedTable = statistic.relatedTables.find((r) => r.queryId === datasource.id)
      return relatedTable ? relatedTable.tbmlId : ''
    }).join(', ')
    return (
      <React.Fragment key={`${log.id}_${status}`}>
        {status} - {tbmls} <br/>
      </React.Fragment>
    )
  }

  function renderJobLogs() {
    return statistic.logData.map((log, index) => {
      return (
        <Accordion
          key={index}
          className={log.status}
          header={`${formatTime(log.completionTime)}: ${log.task} (${log.status})`}
        >
          { log.result.map((result, index) => {
            return (
              <ul key={index}>
                <li key={index}>{result.branch}: {result.status}</li>
              </ul>)
          })}
          <span>Av: {log.user.login}</span>
        </Accordion>
      )
    }
    )
  }
  function formatTime(time) {
    return moment(time).locale('nb').format('DD.MM.YYYY HH.mm')
  }
  const ModalContent = () => {
    return (
      <Modal
        size="lg"
        show={show}
        onHide={handleClose}
        animation={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {statistic.name}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h3>Logg detaljer</h3>
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
  statistic: PropTypes.object
}
