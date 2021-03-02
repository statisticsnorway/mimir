import PropTypes from 'prop-types'
import { Accordion, NestedAccordion } from '@statisticsnorway/ssb-component-library'
import React, { useContext } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import moment from 'moment/min/moment-with-locales'
import { requestJobLogDetails } from './actions'
import { WebSocketContext } from '../../utils/websocket/WebsocketProvider'
import { selectJobLog, selectJobLogDetailsLoaded } from './selectors'

export function StatisticsLogJob(props) {
  const io = useContext(WebSocketContext)
  const dispatch = useDispatch()
  const [firstOpen, setFirstOpen] = React.useState(true)
  const logDetailsLoaded = useSelector(selectJobLogDetailsLoaded(props.statisticId, props.jobId))
  const jobLog = useSelector(selectJobLog(props.statisticId, props.jobId))

  function onToggleAccordion(isOpen) {
    if (firstOpen && isOpen) {
      setFirstOpen(false)
      requestJobLogDetails(dispatch, io, props.jobId, props.statisticId)
    }
    props.setAccordionStatusOnIndex(props.index, isOpen)
  }

  function formatTime(time) {
    return moment(time).locale('nb').format('DD.MM.YYYY HH.mm')
  }

  function renderDetails(eventLog) {
    return <li>{eventLog.id}</li>
  }

  function renderAccordionBody() {
    if (logDetailsLoaded) {
      return (<span>Loaded: { logDetailsLoaded }</span>)
      jobLog.logs.details.map((log, i) => {
        return (
          <NestedAccordion
            key={i}
            header={`${log.displayName})`}
            className="mx-0">
            <ul>
              {log.eventLogResult.map((eventLog) => renderDetails(eventLog))}
            </ul>
          </NestedAccordion>
        )
      })
    } else {
      return (
        <span className="spinner-border spinner-border" />
      )
    }
  }

  return (
    <Accordion
      className={jobLog.status}
      header={`${formatTime(jobLog.completionTime)}: ${jobLog.task} (${jobLog.status})`}
      onToggle={(isOpen) => onToggleAccordion(isOpen)}
      openByDefault={props.accordionOpenStatus}
    >
      {renderAccordionBody()}
    </Accordion>
  )
}

StatisticsLogJob.propTypes = {
  statisticId: PropTypes.string,
  jobId: PropTypes.string,
  accordionOpenStatus: PropTypes.bool,
  setAccordionStatusOnIndex: PropTypes.func,
  index: PropTypes.number
}
