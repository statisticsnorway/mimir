import React from 'react'
import { Link } from '@statisticsnorway/ssb-component-library'

interface HeaderLinkProps {
  linkText?: string
  linkedContent?: string
}

class HeaderLink extends React.Component<HeaderLinkProps> {
  constructor(props: HeaderLinkProps) {
    super(props)
  }

  render() {
    return (
      <section className='headerLinkDownload'>
        <Link href={this.props.linkedContent} isExternal={true} className='ssb-link header'>
          {this.props.linkText}
        </Link>
      </section>
    )
  }
}

export default (props: HeaderLinkProps) => <HeaderLink {...props} />
