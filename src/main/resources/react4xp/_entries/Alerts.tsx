import React from 'react'
import { Dialog } from '@statisticsnorway/ssb-component-library'
import { Container } from 'react-bootstrap'
import { sanitize } from '../../lib/ssb/utils/htmlUtils'

interface AlertsProps {
  alerts: {
    messageType: string
    title: string
    message: string
  }[]
}

const Alerts = (props: AlertsProps) => {
  return (
    <Container>
      {props.alerts.map((alert, index) => {
        return (
          <Dialog className='mt-4 mb-3' key={`alert-${index}`} type={alert.messageType} title={alert.title}>
            <div
              dangerouslySetInnerHTML={{
                __html: sanitize(alert.message.replace(/&nbsp;/g, ' ')),
              }}
            />
          </Dialog>
        )
      })}
    </Container>
  )
}

export default (props: AlertsProps) => <Alerts {...props} />
