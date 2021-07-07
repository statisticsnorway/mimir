import React from 'react'
import { Link, TableLink } from '@statisticsnorway/ssb-component-library'
import { ArrowRight } from 'react-feather'
import PropTypes from 'prop-types'

const Links = (props) => {
  const {
    children,
    href,
    withIcon,
    linkType,
    text,
    description
  } = props

  const renderLinks = () => {
    const renderIcon = typeof withIcon === 'boolean' ? withIcon : withIcon === 'true' // Macro config returns string. This is a workaround.
    return (
      <Link
        href={href}
        icon={renderIcon && <ArrowRight size="20"/>}
        linkType={linkType}
      >
        {children}
      </Link>
    )
  }

  const renderTableLink = () => {
    return (
      <TableLink
        href={href}
        description={description}
        text={text}
      />
    )
  }

  const tableLinkProps = text && description
  return (
    <section className="xp-part part-links">
      {tableLinkProps ? renderTableLink() : renderLinks()}
    </section>
  )
}

Links.propTypes = {
  children: PropTypes.node,
  href: PropTypes.string,
  withIcon: PropTypes.bool | PropTypes.string,
  linkType: PropTypes.oneOf([
    'regular',
    'profiled',
    'header'
  ]),
  text: PropTypes.string,
  description: PropTypes.string
}

export default Links
