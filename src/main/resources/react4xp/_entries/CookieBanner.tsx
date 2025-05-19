import React, { useEffect, useState } from 'react'
import { Button } from '@statisticsnorway/ssb-component-library'

const CookieBanner = () => {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const cookieConsentPresent = document.cookie.includes('cookie-consent=')
    const storedState = localStorage.getItem('seenCookieConsent')

    if (!cookieConsentPresent && storedState === 'yes') {
      blockOptionalCookies()
      localStorage.setItem('seenCookieConsent', 'cleared')
    }

    if (cookieConsentPresent && storedState !== 'yes') {
      localStorage.setItem('seenCookieConsent', 'yes')
    }

    setVisible(!cookieConsentPresent)
  }, [])


  const acceptAllCookies = () => {
    document.cookie = 'cookie-consent=all; path=/; max-age=31536000; SameSite=Lax'
    setVisible(false)
  }

  const acceptOnlyNecessaryCookies = () => {
    document.cookie = 'cookie-consent=necessary; path=/; max-age=31536000; SameSite=Lax'
    blockOptionalCookies()
    setVisible(false)
  }

  function blockOptionalCookies() {
    document.cookie
      .split(';')
      .map((c) => c.trim())
      .forEach((cookie) => {
        const name = cookie.split('=')[0]

        const isCookieToPurge = [
          '_ga',
          'nmstat',
          'app.browse.RecentItemsList',
        ].some((prefix) => name.startsWith(prefix))

        if (isCookieToPurge) {
          document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax`
        }
      })
  }


  if (!visible) return null

  return (
    <div className='cookie-banner'>
      <div className='cookie-banner-content'>
        <h3 className='cookie-banner-title'>Vi bruker informasjonskapsler</h3>
        <p className='cookie-banner-text'>
          Nødvendige informasjonskapsler gjør at ssb.no fungerer og er sikkert, og kan derfor ikke velges bort. Vi har
          tre valgfrie informasjonskapsler som lar oss se hvor brukerne våre klikker og beveger seg på nettsiden.
          Informasjonen er anonym, deles aldri med andre og brukes til å forbedre ssb.no.
        </p>
        <a href='/om-ssb/informasjonskapsler' className='cookie-banner-link'>
          Les mer om informasjonskapsler
        </a>
        <div className='cookie-banner-buttons'>
          <Button className='cookie-button-accept' onClick={acceptAllCookies}>
            Godta alle
          </Button>
          <Button className='cookie-button-decline' onClick={acceptOnlyNecessaryCookies}>
            Kun nødvendige
          </Button>
        </div>
      </div>
    </div>
  )
}

export default (props: object) => <CookieBanner {...props} />
