import React, { useState } from 'react'
import { Accordion, Button } from '@statisticsnorway/ssb-component-library'
import { ChevronDown, ChevronUp } from 'react-feather'

import PropTypes from 'prop-types'
import Table from './Table'
import { addGtagForEvent } from '../ReactGA'

function AttachmentTableFigures(props) {
  const [isHidden, setIsHidden] = useState(true)
  const {
    accordions,
    freeText,
    showAll,
    showLess
  } = props

  function toggleBox() {
    setIsHidden((prevState) => !prevState.isHidden)
  }

  function toggleAccordion(index, isOpen) {
    const {
      contentType, subHeader, open
    } = accordions[index]

    if (isOpen && contentType === `${props.appName}:table` && props.GA_TRACKING_ID) {
      addGtagForEvent(props.GA_TRACKING_ID, 'Utvidet vedleggstabell', 'Statistikkside vedleggstabeller', `${subHeader} ${open}`)
    }
  }

  function getButtonBreakpoint() {
    if (accordions.length > 5) {
      return ''
    }
    return 'd-none'
  }

  function getButtonText() {
    if (isHidden) {
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

  function renderShowMoreButton() {
    return (
      <div className={`row mt-5 hide-show-btn justify-content-center ${getButtonBreakpoint()}`}>
        <div className="col-auto">
          <Button onClick={toggleBox}>
            {getButtonText()}
          </Button>
        </div>
      </div>
    )
  }

  function createMarkup(html) {
    return {
      __html: html
    }
  }

  function getBreakpoint(index) {
    if (isHidden && index > 4) {
      return 'd-none'
    }
    return ''
  }

  function getFreeTextBreakpoint() {
    if (!freeText || isHidden && accordions.length > 5) {
      return 'd-none'
    }
    return 'mt-5'
  }

  function renderAccordionBody(accordion) {
    if (accordion.contentType === `${props.appName}:table`) {
      return (<Table {...accordion.props}/>)
    } else {
      return (<div dangerouslySetInnerHTML={createMarkup(accordion.body)}></div>)
    }
  }

  const location = window.location
  const anchor = location && location.hash !== '' ? location.hash.substr(1) : undefined

  return (
    <section className="xp-part part-accordion container">
      <div className="row">
        {
          accordions.map((accordion, index) => {
            return (
              <Accordion
                key={index}
                className={`col-12 ${getBreakpoint(index)}`}
                id={accordion.id}
                header={accordion.open}
                subHeader={accordion.subHeader}
                openByDefault={anchor && accordion.id && accordion.id === anchor}
                // onToggle={toggleAccordion}
              >
                {renderAccordionBody(accordion)}
              </Accordion>
            )
          }
          )}
      </div>
      <div className={`row free-text-wrapper ${getFreeTextBreakpoint()}`}>
        <div className="col-12 col-lg-6" dangerouslySetInnerHTML={createMarkup(freeText)}></div>
      </div>
      {renderShowMoreButton()}
    </section>
  )
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
