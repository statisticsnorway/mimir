import React from 'react'
import { Badge, Container, Tab, Tabs } from 'react-bootstrap'
import { Zap, ZapOff } from 'react-feather'
import { useSelector } from 'react-redux'
import { StatRegDashboard } from '../StatRegDashboard'
import { selectIsConnected } from './selectors'

export function HomePage() {
  const isConnected = useSelector(selectIsConnected)
  const renderBadge = () => {
    if (isConnected) {
      return (<Badge variant="success"><span>Connected<Zap></Zap></span></Badge>)
    } else {
      return (<Badge variant="danger"><span>Disconnected<ZapOff></ZapOff></span></Badge>)
    }
  }

  return (
    <Container>
      {renderBadge()}
      <Tabs defaultActiveKey="queries">
        <Tab eventKey="queries" title="Spørringer">
          <section className="xp-part part-dashboard container">
            <StatRegDashboard/>
          </section>
        </Tab>
      </Tabs>
    </Container>
  )
}
