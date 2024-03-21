import React, { useState, useRef, useEffect } from 'react'
import { Accordion, Button } from '@statisticsnorway/ssb-component-library'
import { ChevronDown, ChevronUp } from 'react-feather'

import { sanitize } from '../../lib/ssb/utils/htmlUtils'
import {
  type AttachmentTablesFiguresProps,
  type AttachmentTablesFiguresData,
} from '../../lib/types/partTypes/attachmentTablesFigures'

import Table from '../table/Table'
import { addGtagForEvent } from '/react4xp/ReactGA'

function AttachmentTableFigures(props: AttachmentTablesFiguresProps) {
  const [isHidden, setIsHidden] = useState(true)
  const { accordions, freeText, showAll, showLess, title } = props
  const currentElement = useRef<null | HTMLLIElement>(null)
  const [focusElement, setFocusElement] = useState(false)

  function toggleBox() {
    setIsHidden((prevState) => !prevState)
  }

  function keyDownToggleBox(e: React.KeyboardEvent<HTMLButtonElement>) {
    if (e.keyCode === 13 || e.key == 'Enter' || e.keyCode === 32 || e.key == 'Space') {
      e.preventDefault()
      setIsHidden((prevState) => !prevState)
      setFocusElement(!focusElement)
    }
  }

  function toggleAccordion(isOpen: boolean, index: number) {
    const { contentType, subHeader, open } = accordions[index]

    if (isOpen && contentType === `${props.appName}:table` && props.GA_TRACKING_ID) {
      addGtagForEvent(
        props.GA_TRACKING_ID,
        'Utvidet vedleggstabell',
        'Statistikkside vedleggstabeller',
        `${subHeader} ${open}`
      )
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
          <ChevronDown size='20' className='chevron-icons' /> {showAll}
        </span>
      )
    }
    return (
      <span>
        <ChevronUp size='20' className='chevron-icons' />
        {showLess}
      </span>
    )
  }

  function renderShowMoreButton() {
    return (
      <div className={`row mt-5 hide-show-btn justify-content-center ${getButtonBreakpoint()}`}>
        <div className='col-auto'>
          <Button onClick={toggleBox} onKeyDown={(e: React.KeyboardEvent<HTMLButtonElement>) => keyDownToggleBox(e)}>
            {getButtonText()}
          </Button>
        </div>
      </div>
    )
  }

  function getBreakpoint(index: number) {
    if (isHidden && index > 4) {
      return 'd-none'
    }
    return ''
  }

  function getFreeTextBreakpoint() {
    if (!freeText || (isHidden && accordions.length > 5)) {
      return 'd-none'
    }
    return 'mt-5'
  }

  function renderAccordionBody(accordion: AttachmentTablesFiguresData) {
    if (accordion.contentType === `${props.appName}:table`) {
      return <Table {...accordion.props} />
    } else {
      // Table or figure from content studio (no user input), hence no need to sanitize
      return <div dangerouslySetInnerHTML={{ __html: accordion.body! }}></div>
    }
  }

  const location = window.location
  const anchor = location && location.hash !== '' ? location.hash.substr(1) : undefined

  useEffect(() => {
    if (focusElement && currentElement.current) {
      const btn = currentElement.current.firstChild?.firstChild as HTMLButtonElement
      btn.focus()
    }
  }, [isHidden])

  return (
    <React.Fragment>
      <h2>{title}</h2>
      {accordions && (
        <div className='xp-part part-accordion container'>
          <div className='row'>
            <ul>
              {accordions.map((accordion, index) => {
                return (
                  <li key={index} ref={index === 4 ? currentElement : null}>
                    <Accordion
                      key={index}
                      className={`col-12 ${getBreakpoint(index)}`}
                      id={accordion.id}
                      header={accordion.open}
                      subHeader={accordion.subHeader}
                      openByDefault={anchor && accordion.id && accordion.id === anchor}
                      onToggle={(isOpen: boolean) => toggleAccordion(isOpen, index)}
                    >
                      {renderAccordionBody(accordion)}
                    </Accordion>
                  </li>
                )
              })}
            </ul>
          </div>
          <div className={`row free-text-wrapper ${getFreeTextBreakpoint()}`}>
            <div className='col-12 col-lg-6' dangerouslySetInnerHTML={{ __html: sanitize(freeText!) }}></div>
          </div>
          {renderShowMoreButton()}
        </div>
      )}
    </React.Fragment>
  )
}

export default (props: AttachmentTablesFiguresProps) => <AttachmentTableFigures {...props} />
