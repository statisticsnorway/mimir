import React, { useState, useRef, useEffect } from 'react'
import { Accordion, Button, Title } from '@statisticsnorway/ssb-component-library'
import { ChevronDown, ChevronUp } from 'react-feather'

import { sanitize } from '../../lib/ssb/utils/htmlUtils'
import { type StatisticFiguresProps, type StatisticFiguresData } from '../../lib/types/partTypes/statisticFigures'

import Table from '../table/Table'

function StatisticFigures(props: StatisticFiguresProps) {
  const [isHidden, setIsHidden] = useState(true)
  const { accordions, freeText, showAll, showLess, icon } = props
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

  function renderAccordionBody(accordion: StatisticFiguresData) {
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
      <div className='title-wrapper'>
        <Title size={2}>Utvalgte tall fra denne statistikken</Title>
        <div className='icon-wrapper'>
          <img src={icon} alt='' />
        </div>
      </div>
      {accordions && (
        <div className='xp-part part-accordion'>
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
                      openByDefault={index === 0 || (anchor && accordion.id && accordion.id === anchor)}
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

export default (props: StatisticFiguresProps) => <StatisticFigures {...props} />
