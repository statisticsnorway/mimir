import React, { useEffect, useState } from 'react'
import { Button } from '@statisticsnorway/ssb-component-library'
import { type Language, type Phrases } from '/lib/types/language'

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

function CookieBanner(props: { language: Language }): JSX.Element | null {
  const { language } = props
  const phrases = language.phrases as Phrases
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

  const cookieLink =
    language.code == 'en' ? 'https://www.ssb.no/en/omssb/personvern' : 'https://www.ssb.no/omssb/personvern'

  return (
    <section className='cookie-banner' aria-label='Informasjonskapselvalg'>
      <div className='cookie-banner-content'>
        <h3 className='cookie-banner-title'>{phrases.cookieBannerTitle}</h3>
        <p className='cookie-banner-text'>{phrases.cookieBannerText}</p>
        <a href={cookieLink} className='cookie-banner-link'>
          {phrases.cookieBannerLinkText}
        </a>
        <div className='cookie-banner-buttons'>
          <Button className='cookie-button-accept' onClick={() => handleConsent('all')}>
            {phrases.cookieBannerAcceptButton}
          </Button>
          <Button className='cookie-button-decline' onClick={() => handleConsent('necessary')}>
            {phrases.cookieBannerNecessaryButton}
          </Button>
        </div>
      </div>
    </section>
  )
}

export default (props: { language: Language }) => <CookieBanner {...props} />
