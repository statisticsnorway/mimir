import React from 'react'
import { Col, Row } from 'react-bootstrap'

interface RefreshStatisticsStatusProps {
  modal?: object;
}

export function RefreshStatisticsStatus(props: RefreshStatisticsStatusProps) {
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

export default (props) => <RefreshStatisticsStatus {...props} />
