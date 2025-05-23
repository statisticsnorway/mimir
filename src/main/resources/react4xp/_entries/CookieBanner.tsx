import React, { useEffect, useState } from 'react'
import { Button } from '@statisticsnorway/ssb-component-library'
import { blockOptionalCookies } from '../utils/cookieBannerUtils'

const MAX_AGE = 7776000

function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const hasConsent = document.cookie.includes('cookie-consent=')
    if (!hasConsent) {
      blockOptionalCookies()
      setVisible(true)
    }
  }, [])

  const setConsent = (type: 'all' | 'necessary') => {
    if (type === 'necessary') {
      blockOptionalCookies()
    }

    document.cookie = `cookie-consent=${type}; path=/; max-age=${MAX_AGE}; SameSite=Lax`

    setVisible(false)
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
          <Button className='cookie-button-accept' onClick={() => setConsent('all')}>
            Godta alle
          </Button>
          <Button className='cookie-button-decline' onClick={() => setConsent('necessary')}>
            Kun nødvendige
          </Button>
        </div>
      </div>
    </div>
  )
}

export default (props: object) => <CookieBanner {...props} />
