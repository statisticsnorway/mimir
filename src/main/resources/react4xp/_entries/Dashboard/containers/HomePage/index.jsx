import React from 'react'
import { Container, Tab, Tabs } from 'react-bootstrap'
import StatRegDashboard from '../StatRegDashboard'

export function HomePage() {
  return (
    <Container>
      {/* {this.renderBadge()} */}
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
