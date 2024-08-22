import React from 'react'
import { type WebcruiterAdvertismentListProps } from '/lib/types/partTypes/webcruiterAdvertismentList'

const WebcruiterAdvertistmentList = (props: WebcruiterAdvertismentListProps) => {
  const { title } = props
  return <div>{title && <h2>{title}</h2>}</div>
}

export default WebcruiterAdvertistmentList
