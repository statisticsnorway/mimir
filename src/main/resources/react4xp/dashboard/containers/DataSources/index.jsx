import React from 'react'
import { Col, Row } from 'react-bootstrap'
import { DataSourceTable } from './DataSourceTable'
import { selectLoadingErrors, selectDataSourcesByParentType, selectLoadingDefaultDataSources } from './selectors'
import { requestErrorDataSources, requestDefaultDataSources } from './actions'
import { FactPageDataSources } from './FactPageDataSources'
import { StatisticsDataSources } from './StatisticsDataSources'
import { MunicipalDataSources } from './MunicipalDataSources'

export function DataSources() {
  function renderDataSourceTables() {
    return (
      <React.Fragment>
        <DataSourceTable
          header="Spørringer som feilet"
          dataSourceSelector={selectDataSourcesByParentType('error')}
          loadingSelector={selectLoadingErrors}
          requestDataSources={requestErrorDataSources}
          openByDefault={true}
        />
        <FactPageDataSources/>
        <StatisticsDataSources/>
        <MunicipalDataSources/>
        <DataSourceTable
          header="Andre"
          dataSourceSelector={selectDataSourcesByParentType('default')}
          loadingSelector={selectLoadingDefaultDataSources}
          requestDataSources={requestDefaultDataSources}
        />
      </React.Fragment>
    )
  }

  return (
    <section className="xp-part part-dashboard container-fluid p-0">
      <Row>
        <Col>
          <div className="p-4 tables-wrapper datasources">
            <h2 className="mb-3">{`Spørringer mot statistikkbank og tabellbygger`}</h2>
            {renderDataSourceTables()}
          </div>
        </Col>
      </Row>
    </section>
  )
}

export default (props) => <DataSources {...props} />
