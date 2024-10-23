import React, { useState, useEffect } from 'react'
import { X, Clipboard } from 'react-feather'

const Popup = () => {
  const [isOpen, setIsOpen] = useState<boolean | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 767)
  const [isScrolled, setIsScrolled] = useState(false)
  const [hasUserScrolled, setHasUserScrolled] = useState(false)

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
  }

  const closePopup = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsVisible(false)

    const date = new Date()
    date.setTime(date.getTime() + 30 * 24 * 60 * 60 * 1000)
    const expires = `expires=${date.toUTCString()}`
    document.cookie = `hidePopup=true; ${expires}; path=/; SameSite=Lax`
  }

  const openLinkInNewTab = (e: React.MouseEvent) => {
    e.stopPropagation()
    window.open(
      'https://forms.office.com/Pages/ResponsePage.aspx?id=knAhx0CyHU69YfqXupdcvJkAFGNmKDFCsjsXHsjRxlJUNjkzSVZRVDdaOFpEWlJOOE1PNUJLMVdFMS4u&embed=true',
      '_blank',
      'noopener,noreferrer'
    )
    setIsScrolled(false)
  }

  if (isOpen === null || !isVisible) return null

  return (
    <div className={`popup-container ${isOpen ? 'open' : isScrolled ? 'scrolled' : 'closed'}`}>
      {!isOpen ? (
        <div className='popup-closed' onClick={toggleOpen}>
          <Clipboard className='clipboard-icon' size={20} />
          <span className='closed-text'>Undersøkelse ssb.no</span>
        </div>
      ) : (
        <>
          <div className='popup-header' onClick={toggleOpen}>
            <h4 className='header-text'>Hvordan opplever du ssb.no?</h4>
            <div className='close-icon-wrapper' onClick={closePopup}>
              <X className='close-icon' size={24} />
            </div>
          </div>
          <div className='popup-content' onClick={toggleOpen}>
            <p>
              Hjelp oss å gjøre opplevelsen din på ssb.no bedre. Det tar omtrent 6 minutter å svare på vår årlige
              brukerundersøkelse.
            </p>
          </div>
          <div className='button-group'>
            <button className='popup-secondary-button' onClick={closePopup}>
              Svar senere
            </button>
            <button className='popup-button' onClick={openLinkInNewTab}>
              Til undersøkelsen
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default (props: {}) => <Popup {...props} />
