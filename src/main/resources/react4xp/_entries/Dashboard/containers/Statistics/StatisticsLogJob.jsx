import PropTypes from 'prop-types'
import { Accordion } from '@statisticsnorway/ssb-component-library'
import React, { useContext } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import moment from 'moment/min/moment-with-locales'
import { requestJobLogDetails } from './actions'
import { WebSocketContext } from '../../utils/websocket/WebsocketProvider'
import { selectAccordionOpen } from './selectors'

export function StatisticsLogJob(props) {
  const statistic = useSelector(props.selectStatistic)
  const statisticsLogData = useSelector(props.selectStatisticsLogsData)
  const io = useContext(WebSocketContext)
  const dispatch = useDispatch()

  function loadLogs(e, index) {
    if (statistic.logData[index].details.length === 0) {
      requestJobLogDetails(dispatch, io, statistic.logData[index].id, statistic.id)
    }
  }

  function renderModal() {
    return statistic.logData.map((log, index) => {
      const getLogsSelector = selectAccordionOpen(statistic.id, statistic.logData[index].id)
      return (
        <Accordion
          key={index}
          className={log.status}
          header={`${formatTime(log.completionTime)}: ${log.task} (${log.status})`}
          onToggle={(e) => loadLogs(e, index)}
          openByDefault={useSelector(getLogsSelector)}
        >
          <span>Her kommer nestedaccorion</span>
        </Accordion>
      )
    })
  }

  function formatTime(time) {
    return moment(time).locale('nb').format('DD.MM.YYYY HH.mm')
  }

  return (
    renderModal()
  )
}

StatisticsLogJob.propTypes = {
  getStatisticSelector: PropTypes.func
}
