import PropTypes from 'prop-types'
import { StatisticsLog } from './StatisticsLog'
import { Accordion } from '@statisticsnorway/ssb-component-library'
import React from 'react'

export function StatisticsLogJob(props) {
  const {
    statisticId
  } = props

  function renderModal() {
    return statistic.logData.map((log, index) => {
      return (
        <Accordion
          key={index}
          className={log.status}
          header={`${formatTime(log.completionTime)}: ${log.task} (${log.status})`}
          onToggle={() => loadLogs(index)}
        >
          <span>nert</span>
        </Accordion>
      )
    })
  }

  return (
    renderModal()
  )
}

StatisticsLogJob.propTypes = {
  getStatisticSelector: PropTypes.func
}
