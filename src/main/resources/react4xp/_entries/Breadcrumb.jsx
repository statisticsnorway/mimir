import React from 'react'
import { Breadcrumb as SSBBreadcrumb } from '@statisticsnorway/ssb-component-library'
import PropTypes from 'prop-types'

const Breadcrumb = (props) => (
  <div className="container d-print-none">
    <nav className="row mt-2" role="navigation" aria-label="secondary">
      <div className="col-12">
        <SSBBreadcrumb {...props}/>
      </div>
    </nav>
  </div>
)
Breadcrumb.propTypes = {
  crumbs: PropTypes.exact({
    name: PropTypes.string,
    href: PropTypes.string
  })
}

//  items={props.crumbs.map((link, index) => <Link key={index} href={link.href}>{link.name}</Link>)}

export default Breadcrumb
