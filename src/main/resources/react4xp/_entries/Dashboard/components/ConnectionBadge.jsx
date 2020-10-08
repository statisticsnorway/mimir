import React from 'react'
import { Badge } from 'react-bootstrap'
import { Zap, ZapOff } from 'react-feather'

export function ConnectionBadge(props) {
  const {
    isConnected
  } = props
  if (isConnected) {
    return (<Badge variant="success"><span>Connected<Zap></Zap></span></Badge>)
  } else {
    return (<Badge variant="danger"><span>Disconnected<ZapOff></ZapOff></span></Badge>)
  }
}
