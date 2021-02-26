import PropTypes from 'prop-types'
import { Accordion } from '@statisticsnorway/ssb-component-library'
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
  const [isOpenState, setIsOpenState] = React.useState(false)
  const logDetailsLoaded = false // useSelector(selectJobLogDetailsLoaded(props.statisticId, props.jobId))
  const log = useSelector(selectJobLog(props.statisticId, props.jobId))

  function onToggleAccordion(isOpen) {
    if (firstOpen && isOpen) {
      setFirstOpen(false)
      requestJobLogDetails(dispatch, io, props.jobId, props.statisticId)
      // request log details
    }
    setIsOpenState(isOpen)
  }

  function formatTime(time) {
    return moment(time).locale('nb').format('DD.MM.YYYY HH.mm')
  }

  function renderAccordionBody() {
    if (logDetailsLoaded) {
      return (
        <div>
          jobLogDetails
        </div>
      )
    } else {
      return (
        <span className="spinner-border spinner-border" />
      )
    }
  }

  return (
    <Accordion
      className={log.status}
      header={`${formatTime(log.completionTime)}: ${log.task} (${log.status})`}
      onToggle={(isOpen) => onToggleAccordion(isOpen)}
      openByDefault={isOpenState}
    >
      {renderAccordionBody()}
    </Accordion>
  )
}

StatisticsLogJob.propTypes = {
  statisticId: PropTypes.string,
  jobId: PropTypes.string
}
