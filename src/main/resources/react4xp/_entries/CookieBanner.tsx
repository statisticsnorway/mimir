import React, { useState } from 'react'
import { Button } from '@statisticsnorway/ssb-component-library'

const CookieBanner = () => {
  const [visible, setVisible] = useState(true)

  if (!visible) return null

  return (
    <div className='cookie-banner-overlay'>
      <div className='cookie-banner-popup'>
        <div className='cookie-banner__buttons'>
          <Button onClick={() => setVisible(false)}>First</Button>
          <Button onClick={() => setVisible(false)}>Second</Button>
        </div>
      </div>
    </div>
  )
}

export default (props: object) => <CookieBanner {...props} />
