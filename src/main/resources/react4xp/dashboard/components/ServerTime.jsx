import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import moment from 'moment/min/moment-with-locales'

export function ServerTime(props) {
  const { serverTime, serverTimeReceived } = props

  const [currentServerTime, setCurrentServerTime] = useState(null)

  useEffect(
    (prevProps, prevState) => {
      if (serverTime && serverTimeReceived) {
        const timeInterval = setInterval(() => {
          setCurrentServerTime(
            moment
              .parseZone(serverTime)
              .add(Date.now() - new Date(serverTimeReceived), 'ms')
              .format('HH.mm.ss')
          )
        }, 1000)
        return () => clearInterval(timeInterval)
      }
    },
    [props.serverTime, props.serverTimeReceived]
  )

  function renderServerTime() {
    if (currentServerTime) {
      return <span>{currentServerTime}</span>
    }
    return <span className='spinner-border spinner-border-sm my-1' />
  }

  return <div className='server-time'>Serverklokke {renderServerTime()}</div>
}

ServerTime.propTypes = {
  serverTime: PropTypes.string,
  serverTimeReceived: PropTypes.string,
}
