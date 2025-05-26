import React from 'react'
import { Button } from '@statisticsnorway/ssb-component-library'

function CookieBannerResetButton() {
  function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    document.cookie = 'cookie-consent=unidentified; path=/; max-age=7776000; SameSite=Lax'
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
