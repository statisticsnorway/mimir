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
    return (
      <Link
        href={href}
        icon={withIcon && <ArrowRight size="20"/>}
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
  href: PropTypes.string.isRequired,
  isExternal: PropTypes.boolean,
  withIcon: PropTypes.boolean,
  linkType: PropTypes.oneOf([
    'regular',
    'profiled',
    'header'
  ]),
  text: PropTypes.string,
  description: PropTypes.string
}

export default Links
