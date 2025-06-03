import React from 'react'
import { Button } from '@statisticsnorway/ssb-component-library'

const SERVICE_URL = '/_/service/mimir/setCookieConsent'

async function resetCookieConsent() {
  try {
    await fetch(`${SERVICE_URL}?value=unidentified`, { credentials: 'include' })
  } catch (e) {
    console.error('Failed to reset cookie-consent via service', e)
  }
}

function CookieBannerResetButton() {
  function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    resetCookieConsent()
    e.currentTarget.blur()
  }

  return (
    <div>
      <Button
        primary
        onClick={handleClick}
        style={{
          transition: 'none',
          boxShadow: 'none',
          outline: 'none',
          backgroundImage: 'none',
        }}
      >
        Tilbakestill informasjonskapsler
      </Button>
    </div>
  )
}

export default function (props: object) {
  return <CookieBannerResetButton {...props} />
}
