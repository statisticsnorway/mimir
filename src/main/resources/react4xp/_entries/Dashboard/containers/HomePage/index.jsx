import React from 'react'
import { Col, Container, Row, Tab, Tabs } from 'react-bootstrap'
import { useSelector } from 'react-redux'
import { StatRegDashboard } from '../StatRegDashboard'
import { selectDashboardOptions, selectIsConnected } from './selectors'
import { ConnectionBadge } from '../../components/ConnectionBadge'
import { DataSources } from '../DataSources'
import { Statistics } from '../Statistics'
import DashboardTools from '../DashboardTools'
import Jobs from '../Jobs'

export function HomePage() {
  const isConnected = useSelector(selectIsConnected)
  const dashboardOptions = useSelector(selectDashboardOptions)

  function createDatasourcesTab() {
    if (dashboardOptions.dataSources || dashboardOptions.statisticRegister) {
      return (
        <Tab eventKey="queries" title="Spørringer">
          {dashboardOptions.dataSources && <DataSources/>}
          {dashboardOptions.statisticRegister && <StatRegDashboard/>}
        </Tab>
      )
    }
  }

  function createStatisticsTab() {
    if (dashboardOptions.statistics || dashboardOptions.dashboardTools || dashboardOptions.dashboardTools) {
      return (
        <Row>
          <Col className={dashboardOptions.dashboardTools ? 'col-9' : 'col-12'}>
            {dashboardOptions.statistics && <Statistics/>}
            {dashboardOptions.jobLogs && <Jobs/>}
          </Col>
          {dashboardOptions.dashboardTools &&
            <Col className="pl-4">
              <DashboardTools/>
            </Col>}
        </Row>
      )
    }
  }

  return (
    <Container fluid className="px-5">
      <ConnectionBadge isConnected={isConnected} />
      <Tabs defaultActiveKey="statistics">
        <Tab eventKey="statistics" title="Statistikker">
          <Container fluid className="p-0">
            { createStatisticsTab() }
          </Container>
        </Tab>
        { createDatasourcesTab() }
      </Tabs>
    </Container>
  )
}
