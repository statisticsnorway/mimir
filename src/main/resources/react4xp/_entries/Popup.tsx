import React, { useState, useEffect, useRef } from 'react'
import { X, Clipboard } from 'react-feather'
import { Button } from '@statisticsnorway/ssb-component-library'

const Popup = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 767)
  const [isScrolled, setIsScrolled] = useState(false)
  const [hasUserScrolled, setHasUserScrolled] = useState(false)
  const popupContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const checkCookie = document.cookie.split(';').some((cookie) => cookie.trim().startsWith('hidePopup='))

    if (!localStorage.getItem('popupOpen')) {
      localStorage.setItem('popupOpen', 'true')
    }

    const savedIsOpen = localStorage.getItem('popupOpen') === 'true'
    setIsOpen(savedIsOpen)
    setIsVisible(!checkCookie)
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
      if (window.scrollY === 0) {
        setIsScrolled(false)
      } else if (!isOpen && isMobile && hasUserScrolled) {
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
    const newState = !isOpen
    setIsOpen(newState)
    localStorage.setItem('popupOpen', newState.toString())
    setIsScrolled(false)
    setHasUserScrolled(false)
    if (!isOpen && popupContainerRef.current) {
      popupContainerRef.current.focus()
    }
  }

  const closePopup = () => {
    setIsVisible(false)
    localStorage.removeItem('popupOpen')
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
      role='dialog'
      aria-labelledby='popup-title'
      aria-describedby='popup-content'
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
          <div className='popup-header' id='popup-header'>
            <h4 className='header-text' id='popup-title'>
              Hvordan opplever du ssb.no?
            </h4>
            <button className='close-icon-wrapper' aria-label='Lukk' tabIndex={0} onClick={closePopup}>
              <X className='close-icon' size={24} />
            </button>
          </div>
          <div className='popup-content' id='popup-content'>
            <p>
              Hjelp oss å gjøre opplevelsen din på ssb.no bedre. Det tar omtrent 6 minutter å svare på vår årlige
              brukerundersøkelse.
            </p>
          </div>
          <div className='button-group'>
            <Button
              className='ssb-secondary-button'
              onClick={() => {
                toggleOpen()
                if (popupContainerRef.current) {
                  popupContainerRef.current.focus()
                }
              }}
            >
              Svar senere
            </Button>
            <Button primary className='ssb-primary-button' onClick={handlePrimaryButtonClick}>
              Til undersøkelsen
            </Button>
          </div>
        </>
      )}
    </div>
  )
}

export default (props: object) => <Popup {...props} />
