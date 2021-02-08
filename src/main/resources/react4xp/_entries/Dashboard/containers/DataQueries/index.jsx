import React from 'react'
import { useSelector } from 'react-redux'
import { Col, Row } from 'react-bootstrap'
import { selectDataQueries, selectLoading } from './selectors'
import { DataQueryTable } from './DataQueryTable'

export function DataQueries() {
  const dataQueries = useSelector(selectDataQueries)
  const loading = useSelector(selectLoading)

  function renderDataQueryTables() {
    if (loading) {
      return (
        <span className="spinner-border spinner-border" />
      )
    }
    return (
      <React.Fragment>
        <DataQueryTable header="Spørringer som feilet" dataQueryType="error" openByDefault={true}/>
        <DataQueryTable header="Spørringer fra Faktasider" dataQueryType="factPage"/>
        <DataQueryTable header="Spørringer fra Kommunefakta" dataQueryType="municipality"/>
        <DataQueryTable header="Spørringer fra statistikker" dataQueryType="mimir:statistics"/>
        <DataQueryTable header="Andre" dataQueryType="default"/>
      </React.Fragment>
    )
  }

  return (
    <section className="xp-part part-dashboard container mb-5">
      <Row>
        <Col>
          <div className="p-4 tables-wrapper border-top-0">
            <h2 className="mb-3">{`Spørringer mot statistikkbank og tabellbygger (${dataQueries.length} stk)`}</h2>
            {renderDataQueryTables()}
          </div>
        </Col>
      </Row>
    </section>
  )
}

export default (props) => <DataQueries {...props} />
