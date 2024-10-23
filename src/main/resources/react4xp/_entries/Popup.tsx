import React, { useState, useEffect } from 'react'
import { X, Clipboard } from 'react-feather'

const Popup = () => {
  const [isOpen, setIsOpen] = useState<boolean | null>(null) // Start with null to avoid initial render flicker
  const [isVisible, setIsVisible] = useState(true)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 767)

  useEffect(() => {
    const handleResize = () => {
      const isCurrentlyMobile = window.innerWidth <= 767
      if (!isCurrentlyMobile && isMobile && !isOpen) {
        setIsOpen(true) // Open popup only when moving from mobile to desktop and it was closed
      }
      setIsMobile(isCurrentlyMobile) // Update isMobile state based on window size
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize) // Cleanup on unmount
    }
  }, [isMobile, isOpen]) // Only re-run when isMobile or isOpen changes

  useEffect(() => {
    const initialIsMobile = window.innerWidth <= 767
    setIsOpen(!initialIsMobile) // Set initial state based on window size
  }, [])

  if (isOpen === null || !isVisible) return null // Prevent rendering until isOpen is determined

  const toggleOpen = () => {
    setIsOpen(!isOpen)
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
    setIsOpen(false)
  }

  return (
    <div className={`popup-container ${isOpen ? 'open' : 'closed'}`}>
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
