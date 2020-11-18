import React from 'react'
import { CategoryLink } from '@statisticsnorway/ssb-component-library'
import PropTypes from 'prop-types'

const CategoryLinks = (props) => {
  return (
    <React.Fragment>
      <div className="container">
        <div className="row justify-content-center">
          {props.links.map((link, index) => {
            return (
              <CategoryLink
                href={link.href}
                titleText={link.titleText}
                subText={link.subText}
                key={index}
                className='col-12 col-md-5 m-2'
              />
            )
          }
          )}
        </div>
      </div>
    </React.Fragment>
  )
}

CategoryLinks.propTypes = {
  links: PropTypes.arrayOf(
    PropTypes.shape({
      href: PropTypes.string.isRequired,
      titleText: PropTypes.string.isRequired,
      subText: PropTypes.string.isRequired
    })
  )
}

export default CategoryLinks
