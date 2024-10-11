import React, { useState, useEffect } from 'react'
import { ChevronDown, ChevronUp } from 'react-feather'

const Popup = () => {
  const [isOpen, setIsOpen] = useState(window.innerWidth > 767) // Default open on larger viewports, closed on mobile
  const [isVisible, setIsVisible] = useState(true)
  const [isReady, setIsReady] = useState(false) // Delay rendering until state is ready

  // Check if the hidePopup cookie is set
  useEffect(() => {
    const hidePopupCookie = document.cookie.split('; ').find((row) => row.startsWith('hidePopup='))
    if (hidePopupCookie) {
      setIsVisible(false)
    } else {
      // Determine open state based on viewport width
      setIsOpen(window.innerWidth > 767)
      setIsVisible(true)
    }
    setIsReady(true) // Ready to render after determining the state
  }, [])

  // Handle screen resizing for popup state
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 767) {
        setIsOpen(false) // Close on mobile view
      } else {
        setIsOpen(true) // Open on larger view
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const toggleOpen = () => {
    setIsOpen(!isOpen)
  }

  const closePopup = () => {
    setIsVisible(false)

    // Create an expiration date for 30 days from now
    const date = new Date()
    date.setTime(date.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 days in milliseconds
    const expires = `expires=${date.toUTCString()}`

    // Set the cookie with the expires attribute and path
    document.cookie = `hidePopup=true; ${expires}; path=/; SameSite=Lax`
  }

  const openLinkInNewTab = () => {
    window.open(
      'https://forms.office.com/Pages/ResponsePage.aspx?id=knAhx0CyHU69YfqXupdcvJkAFGNmKDFCsjsXHsjRxlJUNjkzSVZRVDdaOFpEWlJOOE1PNUJLMVdFMS4u&embed=true',
      '_blank',
      'noopener,noreferrer'
    )
    // Close popup after the button is clicked
    setIsOpen(false)
  }

  // Render nothing until the state is fully determined
  if (!isReady || !isVisible) return null

  return (
    <div className={`popup-container ${isOpen ? 'open' : 'closed'}`}>
      <button className='popup-header' aria-expanded={isOpen ? 'true' : 'false'} onClick={toggleOpen}>
        <h4 className='header-text'>Hvordan opplever du ssb.no?</h4>
        <div className='icon-wrapper'>
          {isOpen ? (
            <ChevronUp className='expand-icon' size={24} color='white' />
          ) : (
            <ChevronDown className='expand-icon' size={24} color='white' />
          )}
        </div>
      </button>
      {isOpen && (
        <div className='popup-content'>
          <p>
            Hjelp oss å gjøre opplevelsen din på ssb.no bedre. Det tar omtrent 6 minutter å svare på vår årlige
            brukerundersøkelse.
          </p>
          <button className='popup-button' onClick={openLinkInNewTab}>
            Til undersøkelsen
          </button>
          <span className='close-popup' onClick={closePopup}>
            X
          </span>
        </div>
      )}
    </div>
  )
}

export default (props: {}) => <Popup {...props} />
