import React from 'react'
import { Dialog } from '@statisticsnorway/ssb-component-library'
import { Container } from 'react-bootstrap'
import PropTypes from 'prop-types'
import { sanitize } from '/lib/ssb/utils/htmlUtils'

const Alerts = (props) => {
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

Alerts.propTypes = {
  alerts: PropTypes.arrayOf(
    PropTypes.shape({
      messageType: PropTypes.string,
      title: PropTypes.string,
      message: PropTypes.string,
    })
  ).isRequired,
}

export default Alerts
