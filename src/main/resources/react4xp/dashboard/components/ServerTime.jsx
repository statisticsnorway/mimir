import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'

export function ServerTime(props) {
  const {
    serverTime,
    serverTimeReceived
  } = props

  const [currentServerTime, setCurrentServerTime] = useState(null)

  useEffect((prevProps, prevState) => {
    if (serverTime && serverTimeReceived) {
      const timeInterval = setInterval(() => {
        setCurrentServerTime(serverTime + (Date.now() - new Date(serverTimeReceived)))
      }, 1000)
      return () => clearInterval(timeInterval)
    }
  }, [props.serverTime, props.serverTimeReceived])

  function appendZero(num) {
    if (num < 10) return `0${num}`
    return `${num}`
  }

  function renderServerTime() {
    if (currentServerTime) {
      const t = new Date(currentServerTime)
      const hour = appendZero(t.getHours())
      const minute = appendZero(t.getMinutes())
      const second = appendZero(t.getSeconds())
      return <span>{hour}:{minute}:{second}</span>
    }
    return <span className="spinner-border spinner-border-sm my-1" />
  }

  return <div className="server-time">Serverklokke {renderServerTime()}</div>
}

ServerTime.propTypes = {
  serverTime: PropTypes.string,
  serverTimeReceived: PropTypes.string
}

