import React from 'react'
import { Breadcrumb } from '@statisticsnorway/ssb-component-library'

export default (props) => {
  return (
    <nav className='row mt-2' aria-label='secondary'>
      <div className='d-md-none'>
        <Breadcrumb {...props} mobileCompressedView />
      </div>
      <div className='d-none d-md-block'>
        <Breadcrumb {...props} />
      </div>
    </nav>
  )
}
