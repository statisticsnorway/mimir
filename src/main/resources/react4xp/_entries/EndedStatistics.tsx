import React from 'react'
import { Card, Text, ButtonTertiary } from '@statisticsnorway/ssb-component-library'
import { Col, Container, Row } from 'react-bootstrap'
import { EndedStatistic } from '../../lib/types/partTypes/endedStatistics'

interface EndedStatisticsProps {
  endedStatistics: EndedStatistic[]
  iconText: string
  buttonText: string
}

const EndedStatistics = (props: EndedStatisticsProps) => {
  const { endedStatistics, iconText } = props

  const renderContent = () => {
    return (
      <Row className='mt-3'>
        {endedStatistics.map(({ href, title, preamble }, index) => {
          return (
            <Card
              key={`ended-statistics-card-${index}`}
              className={`mb-3`}
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
          <ButtonTertiary id='ended-stat' header={buttonText} className={`button-margin-top`}>
            {renderContent()}
          </ButtonTertiary>
        </Col>
      </Row>
    )
  }

  return <Container>{renderShowMoreButton()}</Container>
}

export default (props: EndedStatisticsProps) => <EndedStatistics {...props} />
