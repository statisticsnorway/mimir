import React from 'react'
import { Link } from '@statisticsnorway/ssb-component-library'
import { ArrowRight, ExternalLink } from 'react-feather'
import PropTypes from 'prop-types'

const Links = (props) => {
  return (
    <React.Fragment>
      {props.links.map((link, index) => {
        return (
          <div key={`link-${index}`}>
            <Link
              className={link.className}
              href={link.href}
              icon={link.iconType ? (link.iconType == 'arrowRight' ? <ArrowRight size="20"/> : <ExternalLink size="18"/>) : undefined}
              isExternal={link.isExternal}
              linkType={link.linkType}
              negative={link.negative}
            >{link.children}
            </Link>
          </div>
        )
      })}
    </React.Fragment>
  )
}

Links.propTypes = {
  links: PropTypes.arrayOf(
    PropTypes.shape({
      children: PropTypes.string,
      className: PropTypes.string,
      href: PropTypes.string.isRequired,
      icon: PropTypes.node,
      iconType: PropTypes.string,
      isExternal: PropTypes.bool,
      linkType: PropTypes.oneOf([
        'regular',
        'profiled',
        'header'
      ]),
      negative: PropTypes.bool
    })
  )
}

export default Links
