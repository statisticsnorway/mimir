import React, { useEffect, useRef, useState } from 'react'
import { Button } from '@statisticsnorway/ssb-component-library'
import { type CookieBannerProps } from '/lib/types/cookieBanner'

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

function CookieBanner(props: CookieBannerProps): JSX.Element | null {
  const { language, phrases, baseUrl } = props
  const [visible, setVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const cookie = getCookie()
    if (!cookie) {
      setCookieViaService('unidentified')
      setVisible(true)
    } else if (cookie === 'unidentified') {
      setVisible(true)
    }
  }, [])

  useEffect(() => {
    if (visible && sectionRef.current) {
      sectionRef.current.focus()
    }
  }, [visible])

  function handleConsent(value: 'all' | 'necessary') {
    setCookieViaService(value)
    setVisible(false)

    window.dataLayer.push({
      event: 'consent_update',
      consent: value,
      analytics_storage: value === 'all' ? 'granted' : 'denied',
    })

    if (typeof window.gtag === 'function') {
      window.gtag('consent', 'update', {
        ad_storage: value === 'all' ? 'granted' : 'denied',
        analytics_storage: value === 'all' ? 'granted' : 'denied',
      })
    }
  }

  if (!visible) return null

  const cookieLink = `${baseUrl}${language == 'en' ? '/en' : ''}/omssb/personvern`

  return (
    <section
      ref={sectionRef}
      className='cookie-banner'
      role='dialog'
      aria-labelledby='cookie-banner-title'
      aria-describedby='cookie-banner-text'
      tabIndex={0}
    >
      <div className='cookie-banner-content'>
        <h3 className='cookie-banner-title' id='cookie-banner-title'>
          {phrases.cookieBannerTitle}
        </h3>
        <p className='cookie-banner-text' id='cookie-banner-text'>
          {phrases.cookieBannerText}
        </p>
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

export default (props: CookieBannerProps) => <CookieBanner {...props} />
