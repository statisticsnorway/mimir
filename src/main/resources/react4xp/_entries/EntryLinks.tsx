import React from 'react'
import { Link, Title } from '@statisticsnorway/ssb-component-library'

interface EntryLinksProps {
  headerTitle?: string;
  entryLinks: {
    title: string;
    href: string;
    icon: string;
    altText?: string;
  }[];
}

class EntryLinks extends React.Component<EntryLinksProps> {
  renderIcon(icon) {
    return (
      <span
        className='box-mobileIcon'
        dangerouslySetInnerHTML={{
          __html: icon,
        }}
      ></span>
    )
  }

  renderEntryLinks() {
    const { entryLinks } = this.props

    return entryLinks.map(({ title, href, icon, mobileIcon, altText }, index) => {
      return (
        <React.Fragment key={`entry-link-${index}`}>
          <div className='col-md-3 mt-4 p-0'>
            <div className='row text-start text-md-center '>
              <div className='col-md-12 col-auto align-items-end d-none d-md-inline'>
                <img src={icon} alt={altText ? altText : ''} className='desktop-icons' />
              </div>
              <div className='col-md-12 col-10 mt-md-4 d-md-flex justify-content-center'>
                <Link href={href} linkType='header' className='d-none d-md-block pt-1' standAlone>
                  {title}
                </Link>
                <Link
                  href={href}
                  linkType='profiled'
                  icon={this.renderIcon(mobileIcon)}
                  className='d-md-none mobile-link-icon'
                  standAlone
                >
                  {title}
                </Link>
              </div>
            </div>
          </div>
        </React.Fragment>
      )
    })
  }

  render() {
    const { headerTitle } = this.props

    return (
      <div className='container mt-4 mb-5'>
        <div className='row'>
          <div className='col-12'>
            <Title size={2}>{headerTitle}</Title>
          </div>
          {this.renderEntryLinks()}
        </div>
      </div>
    )
  }
}

export default (props) => <EntryLinks {...props} />
