import React, { useContext, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Modal } from 'react-bootstrap'
import { Button } from '@statisticsnorway/ssb-component-library'
import { WebSocketContext } from '/react4xp/dashboard/utils/websocket/WebsocketProvider'
import { requestStatisticsJobLog } from '/react4xp/dashboard/containers/Statistics/actions'
import { default as groupBy } from 'ramda/es/groupBy'
import { StatisticsLogJob } from '/react4xp/dashboard/containers/Statistics/StatisticsLogJob'
import { selectStatisticsLogDataLoaded, selectStatistic } from '/react4xp/dashboard/containers/Statistics/selectors'
import { format } from 'date-fns/format'

interface StatisticsLogProps {
  statisticId?: string;
}

export function StatisticsLog(props: StatisticsLogProps) {
  const { statisticId } = props

  const io = useContext(WebSocketContext)
  const dispatch = useDispatch()
  const [show, setShow] = useState(false)
  const [firstOpen, setFirstOpen] = useState(true)
  const [accordionOpenStatus, setAccordionOpenStatus] = useState([])
  const [nestedAccordionStatus, setNestedAccordionStatus] = useState([])
  const statistic = useSelector(selectStatistic(statisticId))
  const logsLoaded = useSelector(selectStatisticsLogDataLoaded(statistic.id))
  const handleClose = () => setShow(false)
  const handleShow = () => setShow(true)

  const openEventlog = () => {
    if (firstOpen) {
      requestStatisticsJobLog(dispatch, io, statistic.id)
      setFirstOpen(false)
    }
    setShow(handleShow)
  }

  function setAccordionStatusOnIndex(index, status) {
    const tmp = accordionOpenStatus
    tmp[index] = status
    setAccordionOpenStatus(tmp)
  }

  function setNestedAccordionWithIndexes(logIndex, detailIndex, status) {
    const logs = nestedAccordionStatus
    const details = logs[logIndex] ? logs[logIndex] : []
    details[detailIndex] = status
    logs[logIndex] = details
    setNestedAccordionStatus(logs)
  }

  function renderLogData() {
    if (statistic && statistic.logData && statistic.logData.length > 0) {
      const log = statistic.logData[0]
      const groupedDataSourceLogs = groupBy((log) => {
        return log.status
      })(log.result)
      const lastUpdated = log.completionTime ? log.completionTime : log.startTime
      const lastUpdatedFormatted = lastUpdated ? format(new Date(lastUpdated), 'dd.MM.yyyy HH:mm') : ''
      return (
        <React.Fragment>
          <span className='d-sm-flex justify-content-center text-center small haveList' onClick={() => openEventlog()}>
            {log.message} - {lastUpdatedFormatted}
            <br />
            {log.user ? log.user.displayName : ''}
            <br />
            {Object.entries(groupedDataSourceLogs).map(([status, dataSourceLogGroup]) =>
              renderDataSourceLogGroup(log, status, dataSourceLogGroup)
            )}
          </span>
          {show ? <ModalContent /> : null}
        </React.Fragment>
      )
    }
    return <span className='d-sm-flex justify-content-center text-center small'>Ingen logger</span>
  }

  function renderDataSourceLogGroup(log, status, dataSourceLogGroup) {
    const tbmls = dataSourceLogGroup
      .map((datasource) => {
        const relatedTable = statistic.relatedTables.find((r) => r.queryId === datasource.id)
        return relatedTable ? relatedTable.tbmlId : ''
      })
      .join(', ')
    return (
      <React.Fragment key={`${log.id}_${status}`}>
        {status} - {tbmls} <br />
      </React.Fragment>
    )
  }

  function renderModalBody() {
    if (logsLoaded) {
      return statistic.logData.map((log, index) => {
        return (
          <StatisticsLogJob
            key={index}
            index={index}
            statisticId={statistic.id}
            jobId={statistic.logData[index].id}
            accordionOpenStatus={!!accordionOpenStatus[index]}
            setAccordionStatusOnIndex={setAccordionStatusOnIndex}
            nestedAccordionStatus={nestedAccordionStatus[index]}
            setNestedAccordionWithIndexes={setNestedAccordionWithIndexes}
          />
        )
      })
    }

    return <span className='spinner-border spinner-border' />
  }

  const ModalContent = () => {
    return (
      <Modal size='lg' show={show} onHide={handleClose} animation={false}>
        <Modal.Header closeButton>
          <Modal.Title>{statistic.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h3>Logg detaljer</h3>
          {renderModalBody()}
          {/* <StatisticsLogJob selectStatistic={getStatisticSelector} /> */}
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={handleClose}>Lukk</Button>
        </Modal.Footer>
      </Modal>
    )
  }

  return renderLogData()
}
