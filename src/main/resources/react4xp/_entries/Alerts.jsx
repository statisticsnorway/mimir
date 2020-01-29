import React from 'react'
import { Dialog } from '@statisticsnorway/ssb-component-library'
import PropTypes from 'prop-types'

const Alerts = (props) => {
  return (
    <React.Fragment>
      {props.alerts.map((alert, index) => {
        return (
          <Dialog
            className="mt-4 mb-3"
            key={`alert-${index}`}
            type={alert.messageType}
            title={alert.title}
          >
            <div
              dangerouslySetInnerHTML={{
                __html: alert.message
              }}
            />
          </Dialog>
        )
      })}
    </React.Fragment>
  )
}

Alerts.propTypes = {
  alerts: PropTypes.arrayOf(
    PropTypes.shape({
      messageType: PropTypes.string,
      title: PropTypes.string,
      message: PropTypes.string
    })
  ).isRequired
}

export default Alerts
