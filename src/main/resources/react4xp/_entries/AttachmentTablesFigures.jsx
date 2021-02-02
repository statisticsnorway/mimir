import React from 'react'
import { Accordion, Button } from '@statisticsnorway/ssb-component-library'
import { ChevronDown, ChevronUp } from 'react-feather'

import PropTypes from 'prop-types'

class AttachmentTableFigures extends React.Component {
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
  }

  getButtonBreakpoint() {
    const {
      accordions
    } = this.props

    if (accordions.length > 5) {
      return ''
    }
    return 'd-none'
  }

  getButtonText() {
    const {
      showAll,
      showLess
    } = this.props

    if (this.state.isHidden) {
      return (
        <span>
          <ChevronDown size="20" className="chevron-icons" /> {showAll}
        </span>
      )
    }
    return (
      <span>
        <ChevronUp size="20" className="chevron-icons" />{showLess}
      </span>
    )
  }

  renderShowMoreButton() {
    return (
      <div className={`row mt-5 hide-show-btn justify-content-center ${this.getButtonBreakpoint()}`}>
        <div className="col-auto">
          <Button onClick={this.toggleBox}>
            {this.getButtonText()}
          </Button>
        </div>
      </div>
    )
  }

  createMarkup(html) {
    return {
      __html: html
    }
  }

  getBreakpoint(index) {
    if (this.state.isHidden && index > 4) {
      return 'd-none'
    }
    return ''
  }

  getFreeTextBreakpoint() {
    const {
      accordions,
      freeText
    } = this.props

    if (this.state.isHidden && accordions.length > 5) {
      return 'd-none'
    } else if (freeText) {
      return 'mt-5'
    }
    return ''
  }

  render() {
    const location = window.location
    const anchor = location && location.hash !== '' ? location.hash.substr(1) : undefined

    const {
      accordions,
      freeText
    } = this.props

    return (
      <section className="xp-part part-accordion container">
        <div className="row">
          {
            accordions.map((accordion, index) =>
              <React.Fragment key={index}>
                <Accordion
                  className={`col-12 ${this.getBreakpoint(index)}`}
                  id={accordion.id}
                  header={accordion.open}
                  subHeader={accordion.subHeader}
                  openByDefault={anchor && accordion.id && accordion.id === anchor}
                >
                  <div dangerouslySetInnerHTML={this.createMarkup(accordion.body)}></div>
                </Accordion>
              </React.Fragment>
            )}
        </div>
        <div className={`row free-text-wrapper ${this.getFreeTextBreakpoint()}`}>
          <div className="col-12 col-lg-6" dangerouslySetInnerHTML={this.createMarkup(freeText)}></div>
        </div>
        {this.renderShowMoreButton()}
      </section>
    )
  }
}

AttachmentTableFigures.propTypes = {
  accordions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      open: PropTypes.string.isRequired,
      subHeader: PropTypes.string,
      body: PropTypes.string.isRequired
    })
  ),
  freeText: PropTypes.string,
  showAll: PropTypes.string,
  showLess: PropTypes.string
}

export default (props) => <AttachmentTableFigures {...props} />
