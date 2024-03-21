import React from 'react'
import { Link } from '@statisticsnorway/ssb-component-library'
import { ArrowRight, ExternalLink } from 'react-feather'

interface LinksProps {
  links: {
    children?: string
    className?: string
    href: string
    icon?: React.ReactNode
    iconType?: string
    isExternal?: boolean
    linkType?: 'regular' | 'profiled' | 'header'
    negative?: boolean
  }[]
}

const Links = ({ links }: LinksProps) => {
  return (
    <React.Fragment>
      {links.map((link, index) => {
        return (
          <div key={`link-${index}`}>
            <Link
              className={link.className}
              href={link.href}
              icon={
                link.iconType ? (
                  link.iconType == 'arrowRight' ? (
                    <ArrowRight size='20' />
                  ) : (
                    <ExternalLink size='18' />
                  )
                ) : undefined
              }
              isExternal={link.isExternal}
              linkType={link.linkType}
              negative={link.negative}
              standAlone
            >
              {link.children}
            </Link>
          </div>
        )
      })}
    </React.Fragment>
  )
}

export default (props: LinksProps) => <Links {...props} />
