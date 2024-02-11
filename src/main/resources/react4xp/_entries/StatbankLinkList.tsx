import React from 'react'
import { Link } from '@statisticsnorway/ssb-component-library'
import { ArrowRight } from 'react-feather'

interface StatbankLinkListProps {
  children?: React.ReactNode;
  className?: string;
  href: string;
  icon?: React.ReactNode;
  iconType?: string;
  linkType?: "regular" | "profiled" | "header";
  negative?: boolean;
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
            __html: props.children,
          }}
        />
      </Link>
    </React.Fragment>
  )
}

export default StatbankLinkList
