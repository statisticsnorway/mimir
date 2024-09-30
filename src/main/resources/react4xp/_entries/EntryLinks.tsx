import React from 'react'
import { Link, Title } from '@statisticsnorway/ssb-component-library'
import { sanitize } from '../../lib/ssb/utils/htmlUtils'
import { EntryLink } from '../../lib/types/partTypes/entryLinks'

interface EntryLinksProps {
  headerTitle?: string
  entryLinks: EntryLink[]
}

const EntryLinks = (props: EntryLinksProps) => {
  const { headerTitle, entryLinks } = props

  function renderIcon(icon: string) {
    return (
      <span
        className='box-mobileIcon'
        dangerouslySetInnerHTML={{
          __html: sanitize(icon),
        }}
      />
    )
  }

  function renderEntryLinks() {
    return entryLinks.map(({ title, href, icon, mobileIcon, altText }, index) => {
      return (
        <div className='col-md-3 mt-4 p-0' key={`entry-link-${index}`}>
          <div className='row text-start text-md-center '>
            <div className='col-md-12 col-auto align-items-end d-none d-md-inline'>
              <img src={icon} alt={altText ? altText : ''} className='desktop-icons' loading='lazy' />
            </div>
            <div className='col-md-12 col-10 mt-md-4 d-md-flex justify-content-center'>
              <Link href={href} linkType='header' className='d-none d-md-block pt-1' standAlone>
                {title}
              </Link>
              <Link
                href={href}
                linkType='profiled'
                icon={renderIcon(mobileIcon!)}
                className='d-md-none mobile-link-icon'
                standAlone
              >
                {title}
              </Link>
            </div>
          </div>
        </div>
      )
    })
  }

  return (
    <div className='container mt-4 mb-5'>
      <div className='row'>
        <div className='col-12'>
          <Title size={2}>{headerTitle}</Title>
        </div>
        {renderEntryLinks()}
      </div>
    </div>
  )
}

export default (props: EntryLinksProps) => <EntryLinks {...props} />
