import React, { useState, useEffect } from 'react'
import { ChevronDown, ChevronUp } from 'react-feather'

const Popup = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const hidePopupCookie = document.cookie.split('; ').find((row) => row.startsWith('hidePopup='))
    if (hidePopupCookie) {
      setIsVisible(false)
    }
  }, [])

  const toggleOpen = () => {
    setIsOpen(!isOpen)
  }

  const closePopup = () => {
    setIsVisible(false)
    document.cookie = 'hidePopup=true; max-age=600; path=/' // Store choice in cookies for 10 minutes
  }

  const openLinkInNewTab = () => {
    window.open(
      'https://forms.office.com/Pages/ResponsePage.aspx?id=knAhx0CyHU69YfqXupdcvJkAFGNmKDFCsjsXHsjRxlJUNjkzSVZRVDdaOFpEWlJOOE1PNUJLMVdFMS4u&embed=true',
      '_blank',
      'noopener,noreferrer'
    )
  }

  if (!isVisible) return null

  return (
    <div className={`popup-container ${isOpen ? 'open' : 'closed'}`}>
      <span
        onClick={closePopup}
        style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          color: 'white',
          fontSize: '16px',
          cursor: 'pointer',
        }}
      >
        X
      </span>
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
        </div>
      )}
    </div>
  )
}

export default (props: {}) => <Popup {...props} />
