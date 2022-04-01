import React from 'react'
import { Zap, ZapOff } from 'react-feather'

export function ConnectionBadge(props) {
  const {
    isConnected
  } = props
  if (isConnected) {
    return (
      <div className="connected-wrapper">
        <Zap /><span className="ms-2">Tilkoblet</span>
      </div>)
  } else {
    return (
      <div className="disconnected-wrapper">
        <ZapOff /><span className="ms-2">Frakoblet</span>
      </div>)
  }
}
