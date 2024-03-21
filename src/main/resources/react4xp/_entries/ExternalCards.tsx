import React from 'react'
import { Card, Text } from '@statisticsnorway/ssb-component-library'
import { Container, Row, Col } from 'react-bootstrap'

interface ExternalCardsProps {
  links: {
    image?: string
    imageAlt?: string
    content?: string
    href: string
    children?: string
  }[]
}

const ExternalCards = (props: ExternalCardsProps) => {
  return (
    <Container>
      <Row className='justify-content-start'>
        {props.links.map((link, index) => {
          return (
            <Col key={`external-card-${index}`} className='external-card col-12 mb-4 col-md-4'>
              <Card
                href={link.href}
                hrefText={link.children}
                icon={link.image && <img src={link.image} alt='' />}
                profiled
                external
                ariaLabel={link.children}
                ariaDescribedBy='text'
              >
                <Text>{link.content}</Text>
              </Card>
            </Col>
          )
        })}
      </Row>
    </Container>
  )
}

export default (props) => <ExternalCards {...props} />
