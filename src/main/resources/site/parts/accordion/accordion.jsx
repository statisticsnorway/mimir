import React from 'react'
import { Accordion as AccordionComponent, Button, NestedAccordion } from '@statisticsnorway/ssb-component-library'
import { ChevronDown, ChevronUp } from 'react-feather'

import PropTypes from 'prop-types'

class Accordion extends React.Component {
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

  renderNestedAccordions(items) {
    return (
      items.map((item, i) =>
        <NestedAccordion key={i} header={item.title}>
          <div dangerouslySetInnerHTML={this.createMarkup(item.body)}/>
        </NestedAccordion>
      )
    )
  }

  createMarkup(html) {
    return {
      __html: html
    }
  }

  getBreakpoint(index, hasButton) {
    if (index > 4 && hasButton && this.state.isHidden) {
      return 'd-none'
    }
    return ''
  }

  render() {
    const location = window.location
    const anchor = location && location.hash !== '' ? location.hash.substr(1) : undefined

    const {
      accordions,
      showAll,
      showLess
    } = this.props

    const hasButton = showAll && showLess
    return (
      <section className="xp-part part-accordion container">
        <div className="row">
          {
            accordions.map((accordion, index) =>
              <AccordionComponent
                className={`col-12 ${this.getBreakpoint(index, hasButton)}`}
                id={accordion.id}
                key={index}
                header={accordion.open}
                subHeader={accordion.subHeader}
                openByDefault={anchor && accordion.id && accordion.id === anchor}
              >
                <div dangerouslySetInnerHTML={this.createMarkup(accordion.body)}></div>
                {this.renderNestedAccordions(accordion.items)}
              </AccordionComponent>
            )}
        </div>
        {hasButton && this.renderShowMoreButton()}
      </section>
    )
  }
}

Accordion.propTypes = {
  accordions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      open: PropTypes.string.isRequired,
      subHeader: PropTypes.string,
      body: PropTypes.string.isRequired,
      items: PropTypes.arrayOf(
        PropTypes.shape({
          title: PropTypes.string.isRequired,
          body: PropTypes.string.isRequired
        })
      )
    })
  ),
  showAll: PropTypes.string,
  showLess: PropTypes.string
}

export default (props) => <Accordion {...props} />
