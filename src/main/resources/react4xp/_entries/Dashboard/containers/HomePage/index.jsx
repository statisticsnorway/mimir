import React from 'react'
import { Col, Container, Row, Tab, Tabs } from 'react-bootstrap'
import { useSelector } from 'react-redux'
import { StatRegDashboard } from '../StatRegDashboard'
import { selectIsConnected } from './selectors'
import { ConnectionBadge } from '../../components/ConnectionBadge'
import { DataSources } from '../DataSources'
import { Statistics } from '../Statistics'
import DashboardTools from '../DashboardTools'
import Jobs from '../Jobs'

export function HomePage() {
  const isConnected = useSelector(selectIsConnected)

  return (
    <Container fluid>
      <Row>
        <Col>
          <ConnectionBadge isConnected={isConnected} />
          <Tabs defaultActiveKey="statistics">
            <Tab eventKey="statistics" title="Statistikker">
              <Container fluid className="p-0">
                <Row>
                  <Col className="col-9">
                    <Statistics/>
                  </Col>
                  <Col className="col">
                    <DashboardTools/>
                  </Col>
                </Row>
                <Row className="mt-3">
                  <Col className="col-12">
                    <Jobs/>
                  </Col>
                </Row>
              </Container>
            </Tab>
            <Tab eventKey="queries" title="Spørringer">
              <DataSources/>
              <StatRegDashboard/>
            </Tab>
          </Tabs>
        </Col>
      </Row>
    </Container>
  )
}
