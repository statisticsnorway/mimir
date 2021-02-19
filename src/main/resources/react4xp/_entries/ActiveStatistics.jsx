import React from 'react'
import { Card, Text } from '@statisticsnorway/ssb-component-library'
import { Col, Container, Row } from 'react-bootstrap'
import PropTypes from 'prop-types'

class ActiveStatistics extends React.Component {
  render() {
    const {
      headerTitle, activeStatistics
    } = this.props
    return (
      <Container>
        <Row>
          <Col className="col-12">
            <h2 className="mt-4 mb-5">{headerTitle}</h2>
          </Col>
          {activeStatistics.map(({
            href, title, preamble
          }, index) => {
            return (
              <Card
                key={index}
                className="mb-3 col-12 col-lg-4"
                href={href}
                title={title}>
                <Text>
                  {preamble}
                </Text>
              </Card>
            )
          })}
        </Row>
      </Container>
    )
  }
}

ActiveStatistics.propTypes = {
  headerTitle: PropTypes.string,
  activeStatistics: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      preamble: PropTypes.string.isRequired,
      href: PropTypes.string.isRequired
    })
  ).isRequired
}

export default (props) => <ActiveStatistics {...props} />
