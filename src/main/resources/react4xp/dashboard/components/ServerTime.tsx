import React, { useState, useEffect } from 'react'
import { default as format } from 'date-fns/format'

interface ServerTimeProps {
  serverTime?: string;
  serverTimeReceived?: string;
}

export function ServerTime(props: ServerTimeProps) {
  const { serverTime, serverTimeReceived } = props

  const [currentServerTime, setCurrentServerTime] = useState(null)

  useEffect(() => {
    if (serverTime && serverTimeReceived) {
      const timeInterval = setInterval(() => {
        // TODO: Maybe a bad solution
        const serverTimeWithoutZone = new Date(serverTime.replace('Z', ''))
        const msToAdd = new Date() - new Date(serverTimeReceived)
        setCurrentServerTime(format(new Date(serverTimeWithoutZone.getTime() + msToAdd), 'HH.mm.ss'))
      }, 1000)
      return () => clearInterval(timeInterval)
    }
  }, [props.serverTime, props.serverTimeReceived])

  function renderServerTime() {
    if (currentServerTime) {
      return <span>{currentServerTime}</span>
    }
    return <span className='spinner-border spinner-border-sm my-1' />
  }

  return <div className='server-time'>Serverklokke {renderServerTime()}</div>
}
