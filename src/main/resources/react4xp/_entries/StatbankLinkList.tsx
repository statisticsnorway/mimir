import React from 'react'
import { Link } from '@statisticsnorway/ssb-component-library'
import { ArrowRight } from 'react-feather'
import { sanitize } from '../../lib/ssb/utils/htmlUtils'

interface StatbankLinkListProps {
  children: string
  className: string
  href: string
  icon: React.ReactNode
  iconType: string
  linkType: 'regular' | 'profiled' | 'header'
}

const StatbankLinkList = (props: StatbankLinkListProps) => {
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
            __html: sanitize(props.children),
          }}
        />
      </Link>
    </React.Fragment>
  )
}

export default (props: StatbankLinkListProps) => <StatbankLinkList {...props} />
