import Button from 'react-bootstrap/Button'
import React, { useContext, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { selectLoadingClearCache } from '../HomePage/selectors'
import { WebSocketContext } from '../../utils/websocket/WebsocketProvider'
import { requestClearCache } from '../HomePage/actions.es6'
import { RefreshCw, Trash } from 'react-feather'
import { Col, Container, Row } from 'react-bootstrap'
import { Dropdown } from '@statisticsnorway/ssb-component-library'
import { selectStatistics, selectLoading, selectHasLoadingStatistic } from '../Statistics/selectors'
import { setOpenStatistic } from '../Statistics/actions'

export function DataQueryTools() {
  const loadingCache = useSelector(selectLoadingClearCache)
  const statistics = useSelector(selectStatistics)
  const loadingStatistics = useSelector(selectLoading)
  const hasLoadingStatistic = useSelector(selectHasLoadingStatistic)
  const io = useContext(WebSocketContext)
  const dispatch = useDispatch()
  const [selectedStat, setSelectedStat] = useState(null)

  function clearCache() {
    requestClearCache(dispatch, io)
  }

  function renderIcon(loading) {
    if (loading) {
      return (<span className="spinner-border spinner-border-sm" />)
    }
    return (<Trash size={16}/>)
  }

  function onStatisticsSearchSelect(e) {
    setSelectedStat(e)
  }

  function renderStatisticsSearch() {
    if (loadingStatistics) {
      return (
        <span className="spinner-border spinner-border-sm ml-2 mb-1" />
      )
    }
    return (
      <Dropdown
        placeholder="Finn statistikk"
        searchable
        items={statistics.map((s) => {
          return {
            title: `${s.shortName} - ${s.name}`,
            id: s.id
          }
        })}
        onSelect={(e) => onStatisticsSearchSelect(e)}
      />
    )
  }

  return (
    <div className="p-4 tables-wrapper">
      <h2>Diverse verktøy</h2>
      <Container>
        <Row className="mb-3">
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
        <Row className="mb-3">
          <Col className="col-10 p-0">
            {renderStatisticsSearch()}
          </Col>
          <Col className="col-2 p-0 pt-1">
            <Button
              variant="primary"
              size="sm"
              className="mx-1"
              onClick={() => setOpenStatistic(dispatch, selectedStat.id)}
              disabled={hasLoadingStatistic || loadingStatistics || !selectedStat}
            >
              { hasLoadingStatistic ? <span className="spinner-border spinner-border-sm" /> : <RefreshCw size={16}/> }
            </Button>
          </Col>
        </Row>
      </Container>
    </div>
  )
}

export default (props) => <DataQueryTools {...props} />
