import React from 'react'
import { Link, TableLink } from '@statisticsnorway/ssb-component-library'
import { ArrowRight } from 'react-feather'
import PropTypes from 'prop-types'
import { addGtagForEvent } from '../../../react4xp/ReactGA'

const Links = (props) => {
  const { children, href, withIcon, linkType, text, description, GA_TRACKING_ID, isPDFAttachment, attachmentTitle } =
    props

  const handleClick = () => {
    if (linkType === 'header') {
      if (GA_TRACKING_ID && isPDFAttachment) addGtagForEvent(GA_TRACKING_ID, 'Åpne PDF', 'Nedlasting', attachmentTitle)
    }
  }

  const renderLinks = () => {
    const renderIcon = typeof withIcon === 'boolean' ? withIcon : withIcon === 'true' // Macro config returns string. This is a workaround.
    return (
      <Link
        href={href}
        icon={renderIcon && <ArrowRight size='20' />}
        linkType={linkType}
        onClick={handleClick}
        standAlone
      >
        {children}
      </Link>
    )
  }

  const renderTableLink = () => {
    return <TableLink href={href} description={description} text={text} />
  }

  const tableLinkProps = text && description
  return <section className='xp-part part-links'>{tableLinkProps ? renderTableLink() : renderLinks()}</section>
}

Links.propTypes = {
  children: PropTypes.node,
  href: PropTypes.string,
  withIcon: PropTypes.bool | PropTypes.string,
  linkType: PropTypes.oneOf(['regular', 'profiled', 'header']),
  text: PropTypes.string,
  description: PropTypes.string,
  GA_TRACKING_ID: PropTypes.string,
  isPDFAttachment: PropTypes.bool,
  attachmentTitle: PropTypes.string,
}

export default Links
