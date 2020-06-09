import React from 'react'
import { Button, Card, Text } from '@statisticsnorway/ssb-component-library'
import PropTypes from 'prop-types'

class RelatedStatistics extends React.Component {
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


  getButtonBreakpoints() {
    const {
      relatedStatistics
    } = this.props
    if (relatedStatistics.length > 6) {
      return '' // always display if it's more than 6
    } else if (relatedStatistics.length > 4) {
      return 'd-xl-none'
    } else if (relatedStatistics.length > 3) {
      return 'd-lg-none'
    }
    return 'd-none' // always hide if there is less than 3
  }

  renderShowMoreButton() {
    const {
      showAll,
      showLess
    } = this.props
    return (
      <div className={`row hide-show-btn justify-content-center justify-content-lg-start ${this.getButtonBreakpoints()}`}>
        <div className="col-auto">
          <Button onClick={this.toggleBox}>{this.state.isHidden ? showAll : showLess}</Button>
        </div>
      </div>
    )
  }

  getBreakpoints(index) {
    if (index < 3) {
      return 'd-block'
    } else if (index < 4) {
      return 'd-lg-block'
    } else if (index < 6) {
      return 'd-xl-block'
    }
    return ''
  }

  render() {
    const {
      relatedStatistics
    } = this.props
    return (
      <div className="container">
        <h2 className="ml-auto mr-auto pt-4">Statistikk</h2>
        <div className="row mt-5">
          {relatedStatistics.map((relatedStatistics, index) => {
            return (
              <Card
                key={index}
                className={`mb-3 col-auto ${this.state.isHidden ? 'd-none' : ''} ${this.getBreakpoints(index)}`}
                href={relatedStatistics.href}
                title={relatedStatistics.title}>
                <Text>
                  {relatedStatistics.preamble}
                </Text>
              </Card>
            )
          })}
        </div>
        {this.renderShowMoreButton()}
      </div>
    )
  }
}

RelatedStatistics.propTypes = {
  relatedStatistics: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      preamble: PropTypes.string.isRequired,
      href: PropTypes.string.isRequired
    })
  ).isRequired,
  showAll: PropTypes.string.isRequired,
  showLess: PropTypes.string.isRequired
}

export default (props) => <RelatedStatistics {...props} />
