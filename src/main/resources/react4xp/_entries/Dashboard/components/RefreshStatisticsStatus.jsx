import React from 'react'
import { Col, Row } from 'react-bootstrap'
import { useSelector } from 'react-redux'
import { selectModalDisplay, selectRefreshMessages } from '../containers/Statistics/selectors'


export function RefreshStatisticsStatus(props) {
  const refreshMessages = useSelector(selectRefreshMessages)
  const modalDisplay = useSelector(selectModalDisplay)

  return (
    <>
      <h2>Oppdaterer { modalDisplay === 'loading' ? <span className="spinner-border spinner-border-sm my-1" /> : null }</h2>
      {
        refreshMessages.map((msg, i) => {
          return <Row key={i}>
            <Col>{msg.name}</Col>
            <Col>{msg.status} {msg.result}</Col>
          </Row>
        })
      }
    </>
  )
}

export default (props) => <RefreshStatisticsStatus {...props} />
