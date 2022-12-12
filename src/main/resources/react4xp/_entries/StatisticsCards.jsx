import React from 'react'
import { Button, Card, Text } from '@statisticsnorway/ssb-component-library'
import { Col, Container, Row } from 'react-bootstrap'
import PropTypes from 'prop-types'

class RelatedStatistics extends React.Component {
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

  getButtonBreakpoints() {
    const { showAll, showLess, statistics } = this.props
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

  renderShowMoreButton() {
    const { showAll, showLess } = this.props
    return (
      <Row className={`justify-content-center justify-content-lg-start p-0 p-lg-auto${this.getButtonBreakpoints()}`}>
        <Col className='col-auto'>
          <Button onClick={this.toggleBox}>{this.state.isHidden ? showAll : showLess}</Button>
        </Col>
      </Row>
    )
  }

  getBreakpoints(index, hasButton) {
    const hideCard = hasButton && this.state.isHidden ? ' d-none' : ''
    if (index < 3) {
      return ' d-block'
    } else if (index < 4) {
      return ` d-lg-block${hideCard}`
    } else if (index < 6) {
      return ` d-xl-block${hideCard}`
    }
    return hideCard
  }

  render() {
    const { headerTitle, statistics, showAll, showLess } = this.props
    const hasButton = showAll && showLess
    return (
      <Container>
        <Row>
          <Col className='col-12'>
            <h2 className='mt-4 mb-5'>{headerTitle}</h2>
          </Col>
          {statistics.map(({ icon, iconAlt, href, title, preamble }, index) => {
            return (
              <Col key='index' className={`mb-3 col-12 col-lg-4${this.getBreakpoints(index, hasButton)}`}>
                <Card href={href} title={title} icon={icon && <img src={icon} alt={iconAlt} />} ariaLabel={title}>
                  <Text>{preamble}</Text>
                </Card>
              </Col>
            )
          })}
        </Row>
        {hasButton && this.renderShowMoreButton()}
      </Container>
    )
  }
}

RelatedStatistics.propTypes = {
  headerTitle: PropTypes.string,
  statistics: PropTypes.arrayOf(
    PropTypes.shape({
      icon: PropTypes.string,
      iconAlt: PropTypes.string,
      title: PropTypes.string.isRequired,
      preamble: PropTypes.string.isRequired,
      href: PropTypes.string.isRequired,
    })
  ).isRequired,
  showAll: PropTypes.string,
  showLess: PropTypes.string,
}

export default (props) => <RelatedStatistics {...props} />
