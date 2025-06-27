import React, { useEffect, useRef, useState } from 'react'
import { Button, Link } from '@statisticsnorway/ssb-component-library'
import { type CookieBannerProps } from '/lib/types/cookieBanner'

const COOKIE_NAME = 'cookie-consent'
const SERVICE_URL = '/_/service/mimir/setCookieConsent'

window.dataLayer = window.dataLayer || []
window.gtag = window.gtag || function () {}

function CookieBanner({ language, phrases, baseUrl }: CookieBannerProps): JSX.Element | null {
  const [visible, setVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)
  const lastCookieRef = useRef<string | null>(null)

  const getCookie = (): string | null => {
    const match = document.cookie.match(new RegExp(`(^|;\\s*)${COOKIE_NAME}=([^;]*)`))
    return match ? match[2] : null
  }

  const setCookieViaService = async (value: 'all' | 'necessary' | 'unidentified') => {
    try {
      await fetch(`${SERVICE_URL}?value=${value}`, { credentials: 'include' })
    } catch (e) {
      console.error(`Failed to set cookie "${value}" via XP service`, e)
    }
  }

  const updateVisibilityFromCookie = (cookie: string | null) => {
    if (!cookie) {
      setCookieViaService('unidentified')
      setVisible(true)
      lastCookieRef.current = 'unidentified'
    } else {
      setVisible(cookie === 'unidentified')
      lastCookieRef.current = cookie
    }
  }

  useEffect(() => {
    updateVisibilityFromCookie(getCookie())

    const interval = setInterval(() => {
      const current = getCookie()
      if (current !== lastCookieRef.current) {
        updateVisibilityFromCookie(current)
      }
    }, 500)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (visible && sectionRef.current) {
      sectionRef.current.focus()
    }
  }, [visible])

  const handleConsent = (value: 'all' | 'necessary') => {
    setCookieViaService(value)
    setVisible(false)

    const consentGranted = value === 'all'

    window.dataLayer.push({
      event: 'consent_update',
      consent: value,
    })

    window.gtag?.('consent', 'update', {
      analytics_storage: consentGranted ? 'granted' : 'denied',
    })
  }

  if (!visible) return null

  const cookieLink = `${baseUrl}${language === 'en' ? '/en' : ''}/omssb/personvern/informasjonskapsler`

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

        <Link href={cookieLink} className='cookie-banner-link' negative>
          {phrases.cookieBannerLinkText}
        </Link>

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
