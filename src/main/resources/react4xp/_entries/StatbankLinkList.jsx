import React from 'react'
import { Link } from '@statisticsnorway/ssb-component-library'
import { ArrowRight } from 'react-feather'
import PropTypes from 'prop-types'

const StatbankLinkList = (props) => {
  return (
    <React.Fragment>
      <Link
        className={props.className}
        href={props.href}
        icon={props.iconType ? props.iconType == 'arrowRight' ? <ArrowRight size='20' /> : '' : undefined}
        linkType={props.linkType}
        standAlone
      >
        <span
          dangerouslySetInnerHTML={{
            __html: props.children,
          }}
        />
      </Link>
    </React.Fragment>
  )
}

StatbankLinkList.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  href: PropTypes.string.isRequired,
  icon: PropTypes.node,
  iconType: PropTypes.string,
  linkType: PropTypes.oneOf(['regular', 'profiled', 'header']),
  negative: PropTypes.bool,
}

export default StatbankLinkList
