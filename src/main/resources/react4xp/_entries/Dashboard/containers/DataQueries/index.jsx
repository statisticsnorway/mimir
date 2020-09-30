import React, { useContext } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { WebSocketContext } from '../../utils/websocket/WebsocketProvider'
import { Col, Row } from 'react-bootstrap'
import { selectDataQueries } from './selectors'

export function DataQueries() {
  const dataQueries = useSelector(selectDataQueries)
  return (
    <section className="xp-part part-dashboard container mb-5">
      <Row>
        <Col>
          <div className="p-4 tables-wrapper">
            <h2 className="mb-3">{`Spørringer mot statistikkbank og tabellbygger (${dataQueries.length} stk)`}</h2>
          </div>
        </Col>
      </Row>
    </section>
  )
}

export default (props) => <DataQueries {...props} />
