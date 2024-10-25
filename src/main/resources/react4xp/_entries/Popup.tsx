import React, { useState, useEffect, useRef } from 'react'
import { X, Clipboard } from 'react-feather'

const Popup = () => {
  const [isOpen, setIsOpen] = useState<boolean | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 767)
  const [isScrolled, setIsScrolled] = useState(false)
  const [hasUserScrolled, setHasUserScrolled] = useState(false)
  const popupContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const initialIsMobile = window.innerWidth <= 767
    setIsMobile(initialIsMobile)
    setIsOpen(!initialIsMobile)
    setIsVisible(true)
  }, [])

  useEffect(() => {
    const handleResize = () => {
      const isCurrentlyMobile = window.innerWidth <= 767

      if (!isCurrentlyMobile && isMobile && !isOpen) {
        setIsOpen(true)
      }

      if (!isCurrentlyMobile && !isOpen) {
        setIsScrolled(false)
      }

      setIsMobile(isCurrentlyMobile)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [isMobile, isOpen])

  useEffect(() => {
    let scrollTimeout: ReturnType<typeof setTimeout> | null = null

    const handleScroll = () => {
      if (!isOpen && isMobile && hasUserScrolled) {
        setIsScrolled(true)
      }
    }
    const onManualScroll = () => {
      setHasUserScrolled(true)
    }

    if (isMobile && !isOpen) {
      scrollTimeout = setTimeout(() => {
        window.addEventListener('scroll', handleScroll)
        window.addEventListener('scroll', onManualScroll)
      }, 500)
    }

    return () => {
      if (scrollTimeout) {
        clearTimeout(scrollTimeout)
      }
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('scroll', onManualScroll)
    }
  }, [isMobile, isOpen, hasUserScrolled])

  const toggleOpen = () => {
    setIsOpen(!isOpen)
    setIsScrolled(false)
    setHasUserScrolled(false)
    if (popupContainerRef.current) {
      popupContainerRef.current.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      toggleOpen()
    }
  }

  const closePopup = () => {
    setIsVisible(false)

    const date = new Date()
    date.setTime(date.getTime() + 7 * 24 * 60 * 60 * 1000)
    const expires = `expires=${date.toUTCString()}`
    document.cookie = `hidePopup=true; ${expires}; path=/; SameSite=Lax`
  }

  const openLinkInNewTab = () => {
    window.open(
      'https://forms.office.com/Pages/ResponsePage.aspx?id=knAhx0CyHU69YfqXupdcvJkAFGNmKDFCsjsXHsjRxlJUNjkzSVZRVDdaOFpEWlJOOE1PNUJLMVdFMS4u&embed=true',
      '_blank',
      'noopener,noreferrer'
    )
    setIsScrolled(false)
    setIsVisible(false)
  }

  const handleButtonKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      action()
    }
  }

  if (!isVisible || isOpen === null) return null

  return (
    <div
      className={`popup-container ${isOpen ? 'open' : isScrolled ? 'scrolled' : 'closed'}`}
      tabIndex={0}
      ref={popupContainerRef}
      onKeyDown={handleKeyDown}
    >
      {!isOpen ? (
        <div
          className='popup-closed'
          role='button'
          tabIndex={-1} // Not focusable, but must have key interaction
          onClick={toggleOpen}
          onKeyDown={handleKeyDown} // Handles "Enter" or "Space" to toggle open
        >
          <Clipboard className='clipboard-icon' size={20} focusable='false' />
          <span className='closed-text'>Undersøkelse ssb.no</span>
        </div>
      ) : (
        <>
          <div className='popup-header' role='presentation' onClick={toggleOpen}>
            <h4 className='header-text'>Hvordan opplever du ssb.no?</h4>
            <div
              className='close-icon-wrapper'
              role='button'
              tabIndex={-1} // Not focusable, but must have key interaction
              onClick={closePopup}
              onKeyDown={(e) => handleButtonKeyDown(e, closePopup)} // Handles "Enter" or "Space" to close the popup
            >
              <X className='close-icon' size={24} />
            </div>
          </div>
          <div className='popup-content' role='presentation' onClick={toggleOpen}>
            <p>
              Hjelp oss å gjøre opplevelsen din på ssb.no bedre. Det tar omtrent 6 minutter å svare på vår årlige
              brukerundersøkelse.
            </p>
          </div>
          <div className='button-group'>
            <button
              className='popup-secondary-button'
              onClick={closePopup}
              onKeyDown={(e) => handleButtonKeyDown(e, closePopup)}
            >
              Svar senere
            </button>
            <button
              className='popup-button'
              onClick={openLinkInNewTab}
              onKeyDown={(e) => handleButtonKeyDown(e, openLinkInNewTab)}
            >
              Til undersøkelsen
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default (props: {}) => <Popup {...props} />
