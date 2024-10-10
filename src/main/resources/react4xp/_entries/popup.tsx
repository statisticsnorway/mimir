import React, { useState, useEffect } from 'react'
import { ChevronDown, ChevronUp, X } from 'react-feather'

// Utility function to manage cookies
const setCookie = (name, value, days) => {
  let expires = ''
  if (days) {
    const date = new Date()
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000)
    expires = '; expires=' + date.toUTCString()
  }
  document.cookie = name + '=' + (value || '') + expires + '; path=/'
}

const getCookie = (name) => {
  const nameEQ = name + '='
  const ca = document.cookie.split(';')
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i]
    while (c.charAt(0) === ' ') c = c.substring(1, c.length)
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length)
  }
  return null
}

const Popup = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isClosed, setIsClosed] = useState(false)

  useEffect(() => {
    // Check if the popup was previously closed by the user
    const closedPopup = getCookie('closedPopup')
    if (closedPopup === 'true') {
      setIsClosed(true)
    }
  }, [])

  const toggleOpen = () => {
    setIsOpen(!isOpen)
    console.log(`State: ${!isOpen ? 'open' : 'closed'}, Icon: ${!isOpen ? 'ChevronUp' : 'ChevronDown'}`)
  }

  const closePopup = () => {
    setIsClosed(true)
    setCookie('closedPopup', 'true', 30) // Save the state in cookies for 30 days
  }

  const openLinkInNewTab = () => {
    window.open(
      'https://forms.office.com/Pages/ResponsePage.aspx?id=knAhx0CyHU69YfqXupdcvJkAFGNmKDFCsjsXHsjRxlJUNjkzSVZRVDdaOFpEWlJOOE1PNUJLMVdFMS4u&embed=true',
      '_blank', // Open in new tab
      'noopener,noreferrer' // Ensures security best practices
    )
  }

  if (isClosed) {
    return null // Don't render the popup if it was closed
  }

  return (
    <div className={`popup-container ${isOpen ? 'open' : 'closed'}`}>
      <div className='popup-header-wrapper'>
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
        <button className='close-button' onClick={closePopup}>
          <X size={24} color='white' />
        </button>
      </div>
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
