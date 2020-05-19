import React from 'react'
import { Breadcrumb } from '@statisticsnorway/ssb-component-library'

export default (props) => (
  <nav className="row mt-2" aria-label="secondary">
    <div className="col-12">
      <Breadcrumb {...props}/>
    </div>
  </nav>
)
