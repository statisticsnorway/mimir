import React from 'react'
import { Col, Row } from 'react-bootstrap'
import { DataQueryTable } from './DataQueryTable'
import { selectLoadingErrors, selectDataQueriesByParentType } from './selectors'
import { requestErrorQueries } from './actions'
import { FactPageQueries } from './FactPageQueries'
import { StatisticsQueries } from './StatisticsQueries'

export function DataQueries() {
  function renderDataQueryTables() {
    return (
      <React.Fragment>
        <DataQueryTable
          header="Spørringer som feilet"
          querySelector={selectDataQueriesByParentType('error')}
          loadingSelector={selectLoadingErrors}
          requestQueries={requestErrorQueries}
        />
        <FactPageQueries/>
        <StatisticsQueries/>
        {/* <DataQueryTable header="Spørringer fra Kommunefakta" dataQueryType="municipality"/> */}
        {/* <DataQueryTable header="Andre" dataQueryType="default"/> */}
      </React.Fragment>
    )
  }

  return (
    <section className="xp-part part-dashboard container mb-5">
      <Row>
        <Col>
          <div className="p-4 tables-wrapper border-top-0">
            <h2 className="mb-3">{`Spørringer mot statistikkbank og tabellbygger`}</h2>
            {renderDataQueryTables()}
          </div>
        </Col>
      </Row>
    </section>
  )
}

export default (props) => <DataQueries {...props} />
