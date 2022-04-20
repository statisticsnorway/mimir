import React from 'react'
import PropTypes from 'prop-types'
import { Card, Text } from '@statisticsnorway/ssb-component-library'
import { Container, Row, Col } from 'react-bootstrap'

const ExternalCards = (props) => {
  return (
    <Container>
      <Row className="justify-content-start">
        {props.links.map((link, index) => {
          return (
            <Col
              key={`external-card-${index}`}
              className="external-card col-12 mb-4 col-md-4">
              <Card
                href={link.href}
                hrefText={link.children}
                icon={link.image && <img src={link.image} alt=''/>}
                profiled external
                ariaLabel={link.children}
                ariaDescribedBy="text"
              >
                <Text>{link.content}</Text>
              </Card>
            </Col>
          )
        }
        )}
      </Row>
    </Container>
  )
}

ExternalCards.propTypes = {
  links: PropTypes.arrayOf(
    PropTypes.shape({
      image: PropTypes.string,
      imageAlt: PropTypes.string,
      content: PropTypes.string,
      href: PropTypes.string.isRequired,
      children: PropTypes.string
    })
  )
}

export default ExternalCards
