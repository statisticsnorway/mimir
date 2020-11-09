import React from 'react'
import { Col, Container, Row, Tab, Tabs } from 'react-bootstrap'
import { useSelector } from 'react-redux'
import { StatRegDashboard } from '../StatRegDashboard'
import { selectIsConnected } from './selectors'
import { ConnectionBadge } from '../../components/ConnectionBadge'
import { DataQueryTools } from '../DataQueryTools'
import { DataQueries } from '../DataQueries'
import { Statistics } from '../Statistics'
import DashboardTools from '../DashboardTools'

export function HomePage() {
  const isConnected = useSelector(selectIsConnected)

  return (
    <Container>
      <ConnectionBadge isConnected={isConnected} />
      <Tabs defaultActiveKey="statistics">
        <Tab eventKey="statistics" title="Statistikker">
          <Container>
            <Row>
              <Col className="col-8">
                <Statistics/>
              </Col>
              <Col className="col-4">
                <DashboardTools/>
              </Col>
            </Row>
          </Container>
        </Tab>
        <Tab eventKey="queries" title="Spørringer">
          <DataQueries/>
          <StatRegDashboard/>
          <DataQueryTools/>
        </Tab>
      </Tabs>
    </Container>
  )
}
