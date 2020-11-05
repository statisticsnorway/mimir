import Button from 'react-bootstrap/Button'
import React, { useContext } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { selectLoadingClearCache } from '../HomePage/selectors'
import { WebSocketContext } from '../../utils/websocket/WebsocketProvider'
import { requestClearCache } from '../HomePage/actions.es6'
import { Trash } from 'react-feather'
import { Col, Container, Row } from 'react-bootstrap'

export function DataQueryTools() {
  const loadingCache = useSelector(selectLoadingClearCache)
  const io = useContext(WebSocketContext)
  const dispatch = useDispatch()

  function clearCache() {
    requestClearCache(dispatch, io)
  }

  function renderIcon(loading) {
    if (loading) {
      return (<span className="spinner-border spinner-border-sm" />)
    }
    return (<Trash size={16}/>)
  }

  return (
    <div className="p-4 tables-wrapper">
      <h2>Diverse verktøy</h2>
      <Container>
        <Row>
          <Col>
            <span>Tøm Cache</span>
            <Button
              size="sm"
              className="mx-3"
              onClick={() => clearCache()}
              disabled={loadingCache}>
              {renderIcon(loadingCache)}
            </Button>
          </Col>
        </Row>
      </Container>
    </div>
  )
}

export default (props) => <DataQueryTools {...props} />
