import React from 'react'
import { Zap, ZapOff } from 'react-feather'

export function ConnectionBadge(props) {
  const {
    isConnected
  } = props
  if (isConnected) {
    return (<div className="connected-wrapper"><Zap></Zap><span className="ml-2">Tilkoblet</span></div>)
  } else {
    return (<div className="disconnected-wrapper"><ZapOff></ZapOff><span className="ml-2">Frakoblet</span></div>)
  }
}
