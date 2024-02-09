import React from 'react'
import { Col, Row } from 'react-bootstrap'
import PropTypes from 'prop-types'

export function RefreshStatisticsStatus(props) {
  const { modalDisplay, updateMessages } = props.modal

  return (
    <React.Fragment>
      <h2 className='mt-4'>
        Oppdaterer {modalDisplay === 'loading' && <span className='spinner-border spinner-border-sm my-1' />}
      </h2>
      {updateMessages.map((msg, i) => {
        return (
          <Row key={i} className='mb-3'>
            <Col>{msg.name}</Col>
            <Col>
              {msg.status}
              <br />
              {msg.result &&
                msg.result.map((rst, t) => {
                  return (
                    <>
                      {rst}
                      <br />
                    </>
                  )
                })}
            </Col>
          </Row>
        )
      })}
    </React.Fragment>
  )
}

RefreshStatisticsStatus.propTypes = {
  modal: PropTypes.object,
}

export default (props) => <RefreshStatisticsStatus {...props} />
