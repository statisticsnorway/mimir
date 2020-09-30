import Button from 'react-bootstrap/Button'
import React, { useContext } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { selectLoadingClearCache } from '../HomePage/selectors'
import { WebSocketContext } from '../../utils/websocket/WebsocketProvider'
import { requestClearCache } from '../HomePage/actions.es6'
import { Col, Row } from 'react-bootstrap'

export function DashboardControls() {
  const loading = useSelector(selectLoadingClearCache)
  const io = useContext(WebSocketContext)
  const dispatch = useDispatch()

  function clearCache() {
    requestClearCache(dispatch, io)
  }

  function renderSpinner() {
    if (loading) {
      return (<span className="spinner-border spinner-border-sm ml-2 mb-1" />)
    }
    return null
  }

  return (
    <section className="xp-part part-dashboard container mb-5">
      <Row>
        <Col>
          <div className="p-4 tables-wrapper">
            <Button onClick={() => clearCache()} disabled={loading}>{renderSpinner()} Tøm Cache</Button>
          </div>
        </Col>
      </Row>
    </section>
  )
}

export default (props) => <DashboardControls {...props} />
