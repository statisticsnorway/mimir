import React from 'react'
import { Button } from '@statisticsnorway/ssb-component-library'

function CookieBannerResetButton() {
  return (
    <div>
      <Button primary>
        Tilbakestill informasjonskapsler
      </Button>
    </div>
  )
}

export default (props: object ) => <CookieBannerResetButton {...props} />
