import React, { useContext } from 'react'
import { Button, Table, Row, Col } from 'react-bootstrap'
import { RefreshCw } from 'react-feather'
import { Accordion } from '@statisticsnorway/ssb-component-library'
import { useDispatch, useSelector } from 'react-redux'
import { selectStatuses, selectLoading } from './selectors'
import { WebSocketContext } from '../../utils/websocket/WebsocketProvider'
import { startRefresh } from './actions.es6'
import { DataSourceLog } from '../DataSources/DataSourceLog'

export function StatRegDashboard() {
  const loading = useSelector(selectLoading)
  const statuses = useSelector(selectStatuses)

  const io = useContext(WebSocketContext)
  const dispatch = useDispatch()

  function statusIcon(hasError) {
    return hasError ? 'error' : 'ok'
  }

  function refreshStatReg(key) {
    startRefresh(dispatch, io, [key])
  }

  function refreshAll() {
    const statRegStatusesNotLoading = statuses.filter((status) => !status.loading)
    startRefresh(dispatch, io, statRegStatusesNotLoading.map((status) => status.key))
  }

  function makeRefreshButton(statRegStatus) {
    return (
      <Button
        variant="primary"
        size="sm"
        className="mx-1"
        onClick={() => refreshStatReg(statRegStatus.key)}
        disabled={statRegStatus.loading}
      >
        { statRegStatus.loading ? <span className="spinner-border spinner-border-sm" /> : <RefreshCw size={16}/> }
      </Button>
    )
  }

  function renderTable() {
    if (loading) {
      return (<span className="spinner-border spinner-border" />)
    }

    return (
      <Table bordered striped>
        <thead>
          <tr>
            <th className="roboto-bold">Spørring</th>
            <th className="roboto-bold">Sist oppdatert</th>
            <th className="roboto-bold">Siste aktivitet</th>
            <th />
          </tr>
        </thead>
        <tbody className="small">
          {statuses.map((statRegStatus) => {
            const {
              displayName,
              modifiedReadable,
              modified,
              logData: {
                showWarningIcon
              },
              key
            } = statRegStatus
            return (
              <tr key={key}>
                <td className={`${statusIcon(showWarningIcon)} dataset`}>
                  <a className="ssb-link my-0 text-capitalize" href="#">{displayName}</a>
                </td>
                <td>{modifiedReadable}<br/>{modified}</td>
                <td><DataSourceLog dataSourceId={key} isStatReg={true}/></td>
                <td className="text-center">{makeRefreshButton(statRegStatus)}</td>
              </tr>
            )
          })}
        </tbody>
      </Table>
    )
  }

  return (
    <section className="xp-part part-dashboard container-fluid p-0 m-0">
      <Row>
        <Col>
          <div className="p-4 tables-wrapper">
            <h2 className="d-inline-block w-75">Data fra Statistikkregisteret</h2>
            <div className="d-inline-block float-end">
              <Button
                onClick={() => refreshAll()}
                disabled={statuses.filter((s) => s.loading).length === statuses.length}
              >
                  Oppdater data
              </Button>
            </div>
            <Accordion header="Status" className="mx-0" openByDefault={true}>
              {renderTable()}
            </Accordion>
          </div>
        </Col>
      </Row>
    </section>
  )
}
