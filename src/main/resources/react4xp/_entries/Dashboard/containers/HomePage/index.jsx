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
          { (dashboardOptions.dataSources) ? <DataSources/> : null }
          { (dashboardOptions.statisticRegister) ? <StatRegDashboard/> : null }
        </Tab>
      )
    }
  }

  function createJobsAndTools() {
    if ( dashboardOptions.jobLogs || dashboardOptions.dashboardTools) {
      return (
        <Row className="mt-3">
          {dashboardOptions.jobLogs &&
            <Col className="col-8">
              <Jobs/>
            </Col>
          }
          {dashboardOptions.dashboardTools &&
            <Col className="col-4">
              <DashboardTools/>
            </Col>
          }
        </Row>
      )
    }
  }

  function createStatistics() {
    if (dashboardOptions.statistics) {
      return (
        <Row>
          <Col className="col-12">
            <Statistics/>
          </Col>
        </Row>
      )
    }
  }

  return (
    <Container>
      <ConnectionBadge isConnected={isConnected} />
      <Tabs defaultActiveKey="statistics">
        <Tab eventKey="statistics" title="Statistikker">
          <Container>
            { createStatistics() }
            { createJobsAndTools() }
          </Container>
        </Tab>
        { createDatasourcesTab() }
      </Tabs>
    </Container>
  )
}
