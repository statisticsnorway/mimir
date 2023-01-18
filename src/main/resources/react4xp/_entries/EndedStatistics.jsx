import React from 'react'
import { Card, Text, ButtonTertiary } from '@statisticsnorway/ssb-component-library'
import { Col, Container, Row } from 'react-bootstrap'
import PropTypes from 'prop-types'

const EndedStatistics = (props) => {
  const { endedStatistics, iconText } = props

  const renderContent = () => {
    return (
      <Row className='mt-3'>
        {endedStatistics.map(({ href, title, preamble }, index) => {
          return (
            <Card
              key={`ended-statistics-card-${index}`}
              className={`mb-3 col-12 col-lg-4`}
              href={href}
              hrefText={iconText}
              title={title}
            >
              <Text>{preamble}</Text>
            </Card>
          )
        })}
      </Row>
    )
  }

  const renderShowMoreButton = () => {
    const { buttonText } = props
    return (
      <Row>
        <Col>
          <ButtonTertiary id='ended-stat' header={buttonText}>
            {renderContent()}
          </ButtonTertiary>
        </Col>
      </Row>
    )
  }

  return <Container>{renderShowMoreButton()}</Container>
}

EndedStatistics.propTypes = {
  endedStatistics: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      preamble: PropTypes.string.isRequired,
      href: PropTypes.string.isRequired,
    })
  ).isRequired,
  iconText: PropTypes.string,
  buttonText: PropTypes.string.isRequired,
}

export default EndedStatistics
