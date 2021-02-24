import PropTypes from 'prop-types'
import { NestedAccordion } from '@statisticsnorway/ssb-component-library'
import React, { useContext, useState } from 'react'
import { useDispatch } from 'react-redux'
import { WebSocketContext } from '../../utils/websocket/WebsocketProvider'
import { requestJobLogDetails } from './actions'

export function StatisticsLogJobDetails(props) {
  const {
    logId,
    statisticId
  } = props

  const io = useContext(WebSocketContext)
  const dispatch = useDispatch()
  const [logs, setLogs] = useState([])
  const [firstTimeLoading, setFirstTimeLoading] = useState(true)

  function renderLogDetail(log, i) {
    return (<NestedAccordion key={i}
      header={log.title}>
      Contetns some osoncoen ten
    </NestedAccordion>
    )
  }

  function renderDetails() {
    return (<span>dfj</span>)
    /* if ( logs.length > 0 ) {
      return logs.map( (log, index) => renderLogDetail(log, index))
    } else {
      if (firstTimeLoading) {
        //console.log('first tie loading alaod gjei gj')
        requestJobLogDetails(dispatch, io, logId, statisticId)
        setFirstTimeLoading(false)
      }
    }*/
  }

  return (
    renderDetails()
  )
}

StatisticsLogJobDetails.propTypes = {
  logId: PropTypes.string,
  statisticId: PropTypes.string
}

