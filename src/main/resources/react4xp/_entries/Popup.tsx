import React, { useState, useEffect, useRef } from 'react'
import { X, Clipboard } from 'react-feather'

const Popup = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 767)
  const [isScrolled, setIsScrolled] = useState(false)
  const [hasUserScrolled, setHasUserScrolled] = useState(false)
  const popupContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const checkCookie = document.cookie.split(';').some((cookie) => cookie.trim().startsWith('hidePopup='))
    if (!checkCookie) {
      setIsVisible(true)
      setIsOpen(true)
    }
  }, [])

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 767)
    }

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      if (!isOpen && isMobile && hasUserScrolled) {
        setIsScrolled(true)
      }
    }
    const onManualScroll = () => {
      setHasUserScrolled(true)
    }

    if (isMobile && !isOpen) {
      setTimeout(() => {
        window.addEventListener('scroll', handleScroll)
        window.addEventListener('scroll', onManualScroll)
      }, 500)
    }

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('scroll', onManualScroll)
    }
  }, [isMobile, isOpen, hasUserScrolled])

  const toggleOpen = () => {
    setIsOpen(!isOpen)
    setIsScrolled(false)
    setHasUserScrolled(false)
    if (!isOpen && popupContainerRef.current) {
      popupContainerRef.current.focus()
    }
  }

  const closePopup = () => {
    setIsVisible(false)
    const date = new Date()
    date.setTime(date.getTime() + 7 * 24 * 60 * 60 * 1000)
    const expires = `expires=${date.toUTCString()}`
    document.cookie = `hidePopup=true; ${expires}; path=/; SameSite=Lax`
  }

  const handlePrimaryButtonClick = () => {
    closePopup()
    window.open(
      'https://forms.office.com/Pages/ResponsePage.aspx?id=knAhx0CyHU69YfqXupdcvJkAFGNmKDFCsjsXHsjRxlJUNjkzSVZRVDdaOFpEWlJOOE1PNUJLMVdFMS4u&embed=true',
      '_blank',
      'noopener,noreferrer'
    )
  }

  const handleClosedButtonKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      toggleOpen()
    }
  }

  if (!isVisible) return null

  return (
    <div
      className={`popup-container ${isOpen ? 'open' : isScrolled ? 'scrolled' : 'closed'}`}
      ref={popupContainerRef}
      tabIndex={isOpen ? -1 : 0}
      onKeyDown={!isOpen ? handleClosedButtonKeyDown : undefined}
    >
      {!isOpen ? (
        <button className='popup-closed' tabIndex={-1} onClick={toggleOpen} onKeyDown={handleClosedButtonKeyDown}>
          <Clipboard className='clipboard-icon' size={20} focusable='false' />
          <span className='closed-text'>Undersøkelse ssb.no</span>
        </button>
      ) : (
        <>
          <div className='popup-header' role='presentation'>
            <h4 className='header-text'>Hvordan opplever du ssb.no?</h4>
            <button className='close-icon-wrapper' aria-label='Lukk' tabIndex={0} onClick={closePopup}>
              <X className='close-icon' size={24} />
            </button>
          </div>
          <div className='popup-content' role='presentation'>
            <p>
              Hjelp oss å gjøre opplevelsen din på ssb.no bedre. Det tar omtrent 6 minutter å svare på vår årlige
              brukerundersøkelse.
            </p>
          </div>
          <div className='button-group'>
            <button
              className='popup-secondary-button'
              onClick={() => {
                toggleOpen()
                if (popupContainerRef.current) {
                  popupContainerRef.current.focus()
                }
              }}
            >
              Svar senere
            </button>
            <button className='popup-button' onClick={handlePrimaryButtonClick}>
              Til undersøkelsen
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default (props: {}) => <Popup {...props} />
