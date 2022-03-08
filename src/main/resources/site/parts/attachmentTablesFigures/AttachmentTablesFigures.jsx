import React from 'react'
import { Accordion, Button } from '@statisticsnorway/ssb-component-library'
import { ChevronDown, ChevronUp } from 'react-feather'

import PropTypes from 'prop-types'
import Table from '../../../react4xp/_entries/Table'
import { addGtagForEvent } from '../../../react4xp/ReactGA'

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

  toggleAccordion(index, isOpen) {
    const {
      contentType, subHeader, open
    } = this.props.accordions[index]

    if (isOpen && contentType === `${this.props.appName}:table` && this.props.GA_TRACKING_ID) {
      addGtagForEvent(this.props.GA_TRACKING_ID, 'Utvidet vedleggstabell', 'Statistikkside vedleggstabeller', `${subHeader} ${open}`)
    }
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

    if (!freeText || this.state.isHidden && accordions.length > 5) {
      return 'd-none'
    }
    return 'mt-5'
  }

  renderAccordionBody(accordion) {
    if (accordion.contentType === `${this.props.appName}:table`) {
      return (<Table {...accordion.props}/>)
    } else {
      return (<div dangerouslySetInnerHTML={this.createMarkup(accordion.body)}></div>)
    }
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
            accordions.map((accordion, index) => {
              const toggleAccordion = this.toggleAccordion.bind(this, index)
              return ( <React.Fragment key={index}>
                <Accordion
                  className={`col-12 ${this.getBreakpoint(index)}`}
                  id={accordion.id}
                  header={accordion.open}
                  subHeader={accordion.subHeader}
                  openByDefault={anchor && accordion.id && accordion.id === anchor}
                  onToggle={toggleAccordion}
                >
                  {this.renderAccordionBody(accordion)}
                </Accordion>
              </React.Fragment>)
            }
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
      contentType: PropTypes.string,
      open: PropTypes.string.isRequired,
      subHeader: PropTypes.string,
      body: PropTypes.string,
      props: PropTypes.object
    })
  ),
  freeText: PropTypes.string,
  showAll: PropTypes.string,
  showLess: PropTypes.string,
  appName: PropTypes.string,
  GA_TRACKING_ID: PropTypes.string
}

export default (props) => <AttachmentTableFigures {...props} />
