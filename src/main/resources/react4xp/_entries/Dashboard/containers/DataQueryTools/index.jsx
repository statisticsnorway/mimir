import Button from 'react-bootstrap/Button'
import React, { useContext } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { WebSocketContext } from '../../utils/websocket/WebsocketProvider'
import { Col, Row } from 'react-bootstrap'
import { selectDataQueriesByType } from '../DataQueries/selectors.es6'
import { requestDatasetUpdate } from '../DataQueries/actions.es6'
import { selectLoading } from '../DataQueries/selectors.es6'

export function DataQueryTools() {
  const io = useContext(WebSocketContext)
  const dispatch = useDispatch()
  const tableQueries = useSelector(selectDataQueriesByType('mimir:table'))
  const loadingQueries = useSelector(selectLoading)

  function refreshAllTables() {
    const ids = tableQueries.filter((q) => !q.loading).map((q) => q.id)
    requestDatasetUpdate(dispatch, io, ids)
  }

  function renderSpinner(loading) {
    if (loading) {
      return (<span className="spinner-border spinner-border-sm ml-2 mb-1" />)
    }
    return null
  }

  const loadingTables = tableQueries.filter((q) => q.loading).length > 0
  return (
    <section className="xp-part part-dashboard container mb-5">
      <Row>
        <Col>
          <div className="p-4 tables-wrapper">
            <Button className="mx-3" disabled={loadingQueries} onClick={() => refreshAllTables()}>
              {`Oppdater alle tabeller (${tableQueries.length})`} {renderSpinner(loadingTables)}
            </Button>
          </div>
        </Col>
      </Row>
    </section>
  )
}

export default (props) => <DataQueryTools {...props} />
