import React, { useEffect, useState } from 'react'
import { Button } from '@statisticsnorway/ssb-component-library'

const COOKIE_NAME = 'cookie-consent'
const SERVICE_URL = '/_/service/mimir/setCookieConsent'

window.dataLayer = window.dataLayer || []
window.gtag = window.gtag || function () {}

function getCookie(): string | null {
  const match = document.cookie.match(new RegExp(`(^|;\\s*)${COOKIE_NAME}=([^;]*)`))
  return match ? match[2] : null
}

async function setCookieViaService(value: 'all' | 'necessary' | 'unidentified') {
  try {
    await fetch(`${SERVICE_URL}?value=${value}`, { credentials: 'include' })
  } catch (e) {
    console.error(`Failed to set cookie "${value}" via XP service`, e)
  }
}

function CookieBanner(): JSX.Element | null {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const cookie = getCookie()
    if (!cookie) {
      setCookieViaService('unidentified')
      setVisible(true)
    } else if (cookie === 'unidentified') {
      setVisible(true)
    }
  }, [])

  function handleConsent(value: 'all' | 'necessary') {
    setCookieViaService(value)
    setVisible(false)

    window.dataLayer.push({
      event: 'consent_update',
      consent: value,
      ad_storage: value === 'all' ? 'granted' : 'denied',
      analytics_storage: value === 'all' ? 'granted' : 'denied',
      ad_personalization: value === 'all' ? 'granted' : 'denied',
      functionality_storage: value === 'all' ? 'granted' : 'denied',
      security_storage: 'granted',
    })

    if (typeof window.gtag === 'function') {
      window.gtag('consent', 'update', {
        ad_storage: value === 'all' ? 'granted' : 'denied',
        analytics_storage: value === 'all' ? 'granted' : 'denied',
      })
    }
  }

  if (!visible) return null

  return (
    <section className='cookie-banner' aria-label='Informasjonskapselvalg'>
      <div className='cookie-banner-content'>
        <h3 className='cookie-banner-title'>Vi bruker informasjonskapsler</h3>
        <p className='cookie-banner-text'>
          Nødvendige informasjonskapsler gjør at ssb.no fungerer og er sikkert, og kan derfor ikke velges bort. Vi har
          tre valgfrie informasjonskapsler som lar oss se hvor brukerne våre klikker og beveger seg på nettsiden.
          Informasjonen er anonym, deles aldri med andre og brukes til å forbedre ssb.no.
        </p>
        <a href='https://www.ssb.no/diverse/cookies-og-analyseverktoy-for-webstatistikk' className='cookie-banner-link'>
          Les mer om informasjonskapsler
        </a>
        <div className='cookie-banner-buttons'>
          <Button className='cookie-button-accept' onClick={() => handleConsent('all')}>
            Godta alle
          </Button>
          <Button className='cookie-button-decline' onClick={() => handleConsent('necessary')}>
            Kun nødvendige
          </Button>
        </div>
      </div>
    </section>
  )
}

export default (props: object) => <CookieBanner {...props} />
