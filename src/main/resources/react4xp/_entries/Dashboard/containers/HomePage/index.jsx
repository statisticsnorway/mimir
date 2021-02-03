import React from 'react'
import { Col, Container, Row, Tab, Tabs } from 'react-bootstrap'
import { useSelector } from 'react-redux'
import { StatRegDashboard } from '../StatRegDashboard'
import { selectIsConnected } from './selectors'
import { ConnectionBadge } from '../../components/ConnectionBadge'
import { DataQueries } from '../DataQueries'
import { Statistics } from '../Statistics'
import DashboardTools from '../DashboardTools'
import Jobs from '../Jobs'

export function HomePage() {
  const isConnected = useSelector(selectIsConnected)

  return (
    <Container>
      <ConnectionBadge isConnected={isConnected} />
      <Tabs defaultActiveKey="statistics">
        <Tab eventKey="statistics" title="Statistikker">
          <Container>
            <Row>
              <Col className="col-12">
                <Statistics/>
              </Col>
            </Row>
            <Row className="mt-3">
              <Col className="col-8">
                <Jobs/>
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
        </Tab>
      </Tabs>
    </Container>
  )
}
