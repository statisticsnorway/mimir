import React from 'react'
import { Breadcrumb, Link } from '@statisticsnorway/ssb-component-library'
import PropTypes, { object } from 'prop-types'
import { Col, Container, Row } from 'react-bootstrap'

function StatbankFrame(props) {
  function breadcrumb(bread) {
    return (
      <nav className='row pt-2 mt-2' aria-label='secondary'>
        <div className='col-12'>{bread && <Breadcrumb items={bread} />}</div>
      </nav>
    )
  }

  return (
    <>
      {breadcrumb(props.breadcrumb)}
      <div className='statbank-overskrift pt-4 pb-4'>
        <Container className='statbank-header container mb-2'>
          <Row className='row'>
            <Col className='md-4'>
              <span className='h2 statbank-title roboto-bold'>{props.title}</span>
            </Col>
            <Col className='md-8 text-end'>
              <Col className='col-md-12 roboto-bold'>
                <Link href={props.statbankHelpLink}>{props.statbankHelpText}</Link>
              </Col>
              <div className='col-md-12'>
                <Link href={'/statbank'}>{props.statbankFrontPage}</Link>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
      <div id='statbank-placeholder'></div>
    </>
  )
}

StatbankFrame.propTypes = {
  title: PropTypes.string,
  breadcrumb: PropTypes.arrayOf(object),
  statbankHelpText: PropTypes.string,
  statbankFrontPage: PropTypes.string,
  statbankHelpLink: PropTypes.string,
}

export default (props) => <StatbankFrame {...props} />
