import React, { useState } from 'react'
import { Button, Card, Text } from '@statisticsnorway/ssb-component-library'
import { Col, Container, Row } from 'react-bootstrap'

interface RelatedStatisticsProps {
  headerTitle?: string
  statistics: {
    icon?: string
    iconAlt?: string
    title: string
    preamble: string
    href: string
  }[]
  showAll?: string
  showLess?: string
}

function RelatedStatistics(props: RelatedStatisticsProps) {
  const { headerTitle, statistics, showAll, showLess } = props
  const [isHidden, setIsHidden] = useState(true)

  function toggleBox() {
    setIsHidden((prevState) => !prevState)
  }

  function getButtonBreakpoints() {
    if (showAll && showLess) {
      if (statistics.length > 6) {
        return '' // always display if it's more than 6
      } else if (statistics.length > 4) {
        return ' d-xl-none'
      } else if (statistics.length > 3) {
        return ' d-lg-none'
      }
      return ' d-none'
    }
    return ' d-none' // always hide if there is less than 3
  }

  function renderShowMoreButton() {
    return (
      <Row className={`justify-content-center justify-content-lg-start p-0 p-lg-auto${getButtonBreakpoints()}`}>
        <Col className='col-auto'>
          <Button onClick={toggleBox}>{isHidden ? showAll : showLess}</Button>
        </Col>
      </Row>
    )
  }

  function getBreakpoints(index: number, hasButton: boolean) {
    const hideCard = hasButton && isHidden ? ' d-none' : ''
    if (index < 3) {
      return ' d-block'
    } else if (index < 4) {
      return ` d-lg-block${hideCard}`
    } else if (index < 6) {
      return ` d-xl-block${hideCard}`
    }
    return hideCard
  }

  const hasButton = showAll && showLess
  return (
    <Container>
      <Row>
        <Col className='col-12'>
          <h2 className='mt-4 mb-5'>{headerTitle}</h2>
        </Col>
        {statistics.map(({ icon, iconAlt, href, title, preamble }, index) => {
          return (
            <Col key={title + index} className={`mb-3 col-12 col-lg-4${getBreakpoints(index, !!hasButton)}`}>
              <Card
                href={href}
                title={title}
                ariaDescribedBy='text'
                icon={icon && <img src={icon} alt={iconAlt ?? ''} />}
              >
                <Text>{preamble}</Text>
              </Card>
            </Col>
          )
        })}
      </Row>
      {hasButton && renderShowMoreButton()}
    </Container>
  )
}

export default (props: RelatedStatisticsProps) => <RelatedStatistics {...props} />
