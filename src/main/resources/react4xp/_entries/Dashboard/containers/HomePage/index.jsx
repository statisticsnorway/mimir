import React from 'react'
import { Container, Tab, Tabs } from 'react-bootstrap'
import { useSelector } from 'react-redux'
import { StatRegDashboard } from '../StatRegDashboard'
import { selectIsConnected } from './selectors'
import { ConnectionBadge } from '../../components/ConnectionBadge'
import { DashboardControls } from '../DashboardControls'
import { DataQueries } from '../DataQueries'

export function HomePage() {
  const isConnected = useSelector(selectIsConnected)

  return (
    <Container>
      <ConnectionBadge isConnected={isConnected} />
      <Tabs defaultActiveKey="queries">
        <Tab eventKey="queries" title="Spørringer">
          <DataQueries/>
          <StatRegDashboard/>
          <DashboardControls/>
        </Tab>
      </Tabs>
    </Container>
  )
}
