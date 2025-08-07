import React, { useEffect, useRef, useState } from 'react'
import { Button, Link } from '@statisticsnorway/ssb-component-library'
import { type CookieBannerProps } from '/lib/types/cookieBanner'

const COOKIE_NAME = 'cookie-consent'
const SERVICE_URL = '/_/service/mimir/setCookieConsent'
const MAX_FETCH_FAILURES = 3
let failureCount = 0
let pollingInterval: number

window.dataLayer = window.dataLayer || []
window.gtag = window.gtag || function () {}

function CookieBanner({
  language,
  phrases,
  baseUrl,
  cookieBannerTitle,
  cookieBannerText,
  cookieBannerLinkText,
}: CookieBannerProps): JSX.Element | null {
  const [visible, setVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)
  const lastCookieRef = useRef<string | null>(null)

  const getCookie = (): string | null => {
    const match = document.cookie.match(new RegExp(`(^|;\\s*)${COOKIE_NAME}=([^;]*)`))
    return match ? match[2] : null
  }

  const setCookieViaService = async (value: 'all' | 'necessary' | 'unidentified') => {
    if (failureCount >= MAX_FETCH_FAILURES) return
    try {
      const res = await fetch(`${SERVICE_URL}?value=${value}`, { credentials: 'include' })
      if (!res.ok) {
        failureCount++
        console.error('Failed to set cookie via service')
        if (failureCount >= MAX_FETCH_FAILURES) clearInterval(pollingInterval)
        return
      }
      failureCount = 0
    } catch {
      failureCount++
      console.error('Failed to set cookie via service')
      if (failureCount >= MAX_FETCH_FAILURES) clearInterval(pollingInterval)
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
    pollingInterval = setInterval(() => {
      const current = getCookie()
      if (current !== lastCookieRef.current) {
        updateVisibilityFromCookie(current)
      }
    }, 500)
    return () => clearInterval(pollingInterval)
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
        <h2 className='cookie-banner-title h3' id='cookie-banner-title'>
          {cookieBannerTitle}
        </h2>
        <p className='cookie-banner-text' id='cookie-banner-text'>
          {cookieBannerText}
        </p>
        <Link href={cookieLink} className='cookie-banner-link' negative>
          {cookieBannerLinkText}
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
