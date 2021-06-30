import React from 'react'
import { Link } from '@statisticsnorway/ssb-component-library'
import { ArrowRight, ExternalLink } from 'react-feather'
import PropTypes from 'prop-types'

const Links = (props) => {
  return (
    <React.Fragment>
      <Link
        className={props.className}
        href={props.href}
        icon={props.iconType ? (props.iconType == 'arrowRight' ? <ArrowRight size="20"/> : <ExternalLink size="18"/>) : undefined}
        isExternal={props.isExternal}
        linkType={props.linkType}
        negative={props.negative}
      >
        <span
          dangerouslySetInnerHTML={{
            __html: props.children
          }} />
      </Link>
    </React.Fragment>
  )
}

Links.propTypes = {
  children: PropTypes.node,
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
}

export default Links
