import React from 'react'
import { Button, Card, Text } from '@statisticsnorway/ssb-component-library'
import PropTypes from 'prop-types'
import { ChevronDown, ChevronUp } from 'react-feather'

class EndedStatistics extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      isHidden: true
    }

    this.toggleBox = this.toggleBox.bind(this)
  }

  toggleBox() {
    this.setState((prevState) => ({
      isHidden: !prevState.isHidden
    }))
  };

  renderIcon() {
    if (this.state.isHidden) {
      return <ChevronDown size={18} />
    }
    return <ChevronUp size={18} />
  }

  renderShowMoreButton() {
    const {
      buttonText
    } = this.props
    return (
      <div className="row hide-show-btn">
        <div className="col">
          <Button onClick={this.toggleBox}>{this.renderIcon()}{buttonText}</Button>
        </div>
      </div>
    )
  }

  render() {
    const {
      endedStatistics
    } = this.props
    return (
      <div className="container">
        {this.renderShowMoreButton()}
        <div className="row mt-3">
          {endedStatistics.map(({
            href, title, preamble
          }, index) => {
            return (
              <Card
                key={index}
                className={`mb-3 col-12 col-lg-4 ${this.state.isHidden ? 'd-none' : ''}`}
                href={href}
                title={title}>
                <Text>
                  {preamble}
                </Text>
              </Card>
            )
          })}
        </div>
      </div>
    )
  }
}

EndedStatistics.propTypes = {
  endedStatistics: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      preamble: PropTypes.string.isRequired,
      href: PropTypes.string.isRequired
    })
  ).isRequired,
  endedCardText: PropTypes.string,
  buttonText: PropTypes.string.isRequired
}

export default (props) => <EndedStatistics {...props} />
