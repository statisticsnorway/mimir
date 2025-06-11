import React, { useEffect, useState } from 'react'
import { Button } from '@statisticsnorway/ssb-component-library'
import { type CookieBannerProps } from '/lib/types/cookieBanner'

const COOKIE_NAME = 'cookie-consent'
const SERVICE_URL = '/_/service/mimir/setCookieConsent'

window.dataLayer = window.dataLayer || []
window.gtag = window.gtag || function () {}

const GA_COOKIES_TO_REMOVE = ['_ga', '_gid', '_gat', '_ga_RWG24LNZ9T']

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

function removeAllGACookies() {
  document.cookie.split(';').forEach((cookie) => {
    const name = cookie.split('=')[0].trim()
    if (GA_COOKIES_TO_REMOVE.includes(name)) {
      deleteCookie(name)
    }
  })
}

function deleteCookie(name: string) {
  const cookieRemoval = `${name}=; Max-Age=0; path=/`
  document.cookie = `${cookieRemoval}; SameSite=Lax`
  document.cookie = cookieRemoval
}

function CookieBanner(props: CookieBannerProps): JSX.Element | null {
  const { language, phrases, baseUrl } = props
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const cookie = getCookie()
    if (cookie !== 'all') {
      removeAllGACookies()
    }
    if (!cookie) {
      setCookieViaService('unidentified')
      setVisible(true)
    } else if (cookie === 'unidentified') {
      setVisible(true)
    }
  }, [])

  function handleConsent(value: 'all' | 'necessary' | 'unidentified') {
    if (value !== 'all') {
      removeAllGACookies()
    }

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

  const cookieLink = `${baseUrl}${language == 'en' ? '/en' : ''}/omssb/personvern`

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

export default (props: CookieBannerProps) => <CookieBanner {...props} />
