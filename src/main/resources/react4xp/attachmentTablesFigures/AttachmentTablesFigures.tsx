import React, { useState, useRef, useEffect } from 'react'
import { Button, Details } from '@digdir/designsystemet-react'
import { ChevronDown, ChevronUp } from 'react-feather'

import { sanitize } from '/lib/ssb/utils/htmlUtils'
import {
  type AttachmentTablesFiguresProps,
  type AttachmentTablesFiguresData,
} from '/lib/types/partTypes/attachmentTablesFigures'
import { type TableProps } from '/lib/types/partTypes/table'

import Table from '../table/Table'

function AttachmentTableFigures(props: Readonly<AttachmentTablesFiguresProps>) {
  const [isHidden, setIsHidden] = useState(true)
  const { accordions, freeText, showAll, showLess, firstItemOpen } = props
  const currentElement = useRef<null | HTMLLIElement>(null)
  const [focusElement, setFocusElement] = useState(false)
  const [checkOverflow, setCheckOverflow] = useState(false)

  useEffect(() => {
    if (focusElement && currentElement.current) {
      const btn = currentElement.current.firstChild?.firstChild as HTMLButtonElement
      btn.focus()
    }
  }, [isHidden])

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

  function renderAccordionBody(accordion: AttachmentTablesFiguresData) {
    if (accordion.contentType === `${props.appName}:table`) {
      return <Table checkIsOverflowing={checkOverflow} {...(accordion.props as TableProps)} />
    } else {
      // Table or figure from content studio (no user input), hence no need to sanitize
      return <div dangerouslySetInnerHTML={{ __html: accordion.body! }}></div>
    }
  }

  const location = window.location
  const anchor = location && location.hash !== '' ? location.hash.substring(1) : undefined

  return (
    <>
      {accordions && (
        <div className='xp-part part-accordion container'>
          {accordions.map((accordion, index) => {
            return (
              <Details
                className={`col-12 ${getBreakpoint(index)}`}
                key={accordion.id}
                id={accordion.id}
                defaultOpen={!!((firstItemOpen && index === 0) || (anchor && accordion.id && accordion.id === anchor))}
                onToggle={() => {
                  setCheckOverflow((prev) => !prev)
                }}
              >
                <Details.Summary data-size='lg'>
                  <strong>{accordion.subHeader}</strong>
                  {accordion.subHeader && ' – '} {accordion.open}
                </Details.Summary>
                <Details.Content>{renderAccordionBody(accordion)}</Details.Content>
              </Details>
            )
          })}
          <div className={`row free-text-wrapper ${getFreeTextBreakpoint()}`}>
            <div className='col-12 col-lg-6' dangerouslySetInnerHTML={{ __html: sanitize(freeText!) }}></div>
          </div>
          {renderShowMoreButton()}
        </div>
      )}
    </>
  )
}

export default (props: AttachmentTablesFiguresProps) => <AttachmentTableFigures {...props} />
