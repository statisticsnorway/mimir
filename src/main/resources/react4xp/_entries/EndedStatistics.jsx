import React from 'react'
import { Button, Card, Text } from '@statisticsnorway/ssb-component-library'
import { Col, Container, Row } from 'react-bootstrap'
import PropTypes from 'prop-types'
import { ChevronDown, ChevronUp } from 'react-feather'

class EndedStatistics extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      isHidden: true,
    }

    this.toggleBox = this.toggleBox.bind(this)
  }

  toggleBox() {
    this.setState((prevState) => ({
      isHidden: !prevState.isHidden,
    }))
  }

  renderIcon() {
    if (this.state.isHidden) {
      return <ChevronDown size={20} className='me-2' />
    }
    return <ChevronUp size={20} className='me-2' />
  }

  renderShowMoreButton() {
    const { buttonText } = this.props
    return (
      <Row>
        <Col>
          <Button onClick={this.toggleBox}>
            {this.renderIcon()}
            {buttonText}
          </Button>
        </Col>
      </Row>
    )
  }

  render() {
    const { endedStatistics, iconText } = this.props
    return (
      <Container>
        {this.renderShowMoreButton()}
        <Row className='mt-3'>
          {endedStatistics.map(({ href, title, preamble }, index) => {
            return (
              <Card
                key={`ended-statistics-card-${index}`}
                className={`mb-3 col-12 col-lg-4 ${this.state.isHidden ? 'd-none' : ''}`}
                href={href}
                hrefText={iconText}
                title={title}
              >
                <Text>{preamble}</Text>
              </Card>
            )
          })}
        </Row>
      </Container>
    )
  }
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

export default (props) => <EndedStatistics {...props} />
