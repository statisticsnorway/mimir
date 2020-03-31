import React from 'react'
import { Link } from '@statisticsnorway/ssb-component-library'
import { ArrowRight, ExternalLink } from 'react-feather'
import PropTypes from 'prop-types'

function createMarkup(html) {
  return {
    __html: html
  }
}

const Links = (props) => {
  return (
    <div>
      {props.links.map((link, index) => {
        return (
          <Link
            key={`link-${index}`}
            className={link.className}
            href={link.href}
            icon={link.hasIcon ? (link.iconType == 'arrowRight' ? <ArrowRight size="20"/> : <ExternalLink size="15"/>) : undefined}
            isExternal={link.isExternal}
            linkType={link.linkType}
            negative={link.negative}
            {...props}
          >
            <div dangerouslySetInnerHTML={createMarkup(link.children)}/>
          </Link>
        )
      })
      }
    </div>
  )
}

Links.propTypes = {
  links: PropTypes.arrayOf(
    PropTypes.shape({
      children: PropTypes.node,
      className: PropTypes.string,
      hasIcon: PropTypes.bool,
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
