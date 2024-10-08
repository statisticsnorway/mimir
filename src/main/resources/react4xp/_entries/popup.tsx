import React, { useState } from 'react'
import { ChevronDown, ChevronUp } from 'react-feather'

const Popup = () => {
  const [isOpen, setIsOpen] = useState(false)

  const toggleOpen = () => {
    setIsOpen(!isOpen)
    console.log(`State: ${!isOpen ? 'open' : 'closed'}, Icon: ${!isOpen ? 'ChevronUp' : 'ChevronDown'}`)
  }

  const openLinkInNewTab = () => {
    window.open(
      'https://forms.office.com/Pages/ResponsePage.aspx?id=knAhx0CyHU69YfqXupdcvJkAFGNmKDFCsjsXHsjRxlJUNjkzSVZRVDdaOFpEWlJOOE1PNUJLMVdFMS4u&embed=true',
      '_blank', // Open in new tab
      'noopener,noreferrer' // Ensures security best practices
    )
  }

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
        </div>
      )}
    </div>
  )
}

export default () => <Popup />
