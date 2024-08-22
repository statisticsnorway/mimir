import React from 'react'
import { Accordion, Button, Link } from '@statisticsnorway/ssb-component-library'
import { ArrowRight, ArrowUp, Facebook, Twitter, Rss, Linkedin } from 'react-feather'
import { FooterContent } from '../../lib/types/footer'

const Footer = (props: FooterContent) => {
  const {
    logoUrl,
    footerNavigation,
    topButtonText,
    hiddenFooterText,
    language,
    facebookUrl,
    twitterUrl,
    linkedinUrl,
    rssUrl,
    globalLinks,
    copyrightUrl,
    copyrightText,
  } = props
  const footerNavigationLabel = language?.code === 'en' ? 'footer links' : 'bunnmeny lenker'

  function renderFooterMenuDesktop() {
    return footerNavigation?.map((topMenuItem, index) => {
      if (topMenuItem && topMenuItem.title) {
        const titleId = topMenuItem.title.replaceAll(' ', '-').toLowerCase()
        const listTitle = `footer-link-title-${titleId}`
        return (
          <div key={index} className='footer-link'>
            <h3 className='ssb-title negative' id={listTitle}>
              {topMenuItem.title}
            </h3>
            <ul aria-labelledby={listTitle}>{renderFooterLinkMenu(topMenuItem)}</ul>
          </div>
        )
      }
      return
    })
  }

  function renderFooterMenuMobile() {
    return footerNavigation?.map((topMenuItem, index) => {
      if (topMenuItem && topMenuItem.title) {
        const titleId = topMenuItem.title.replaceAll(' ', '-').toLowerCase()
        const listTitle = `footer-mobile-link-title-${titleId}`
        return (
          <Accordion key={index} header={topMenuItem.title}>
            <h3 className='sr-only sr-only-focusable' id={listTitle}>
              {topMenuItem.title}
            </h3>
            <ul aria-labelledby={listTitle}>{renderFooterLinkMenu(topMenuItem)}</ul>
          </Accordion>
        )
      }
      return
    })
  }

  function renderFooterLinkMenu(topMenuItem: FooterContent['footerNavigation'][0]) {
    return (
      topMenuItem.menuItems &&
      topMenuItem.menuItems.map((menuItem, itemIndex) => {
        if (menuItem && menuItem.path && menuItem.title) {
          return (
            <li key={itemIndex}>
              <Link negative href={menuItem.path} icon={<ArrowRight size='20' />}>
                {menuItem.title}
              </Link>
            </li>
          )
        }
        return
      })
    )
  }

  function renderSocialLinks() {
    if (facebookUrl && twitterUrl && linkedinUrl && rssUrl) {
      return (
        <div className='social-links'>
          <Link ariaLabel='Facebook' href={facebookUrl} isExternal negative icon={<Facebook size={24} />} standAlone />
          <Link ariaLabel='Twitter' href={twitterUrl} isExternal negative icon={<Twitter size={24} />} standAlone />
          <Link ariaLabel='Linkedin' href={linkedinUrl} isExternal negative icon={<Linkedin size={24} />} standAlone />
          <Link ariaLabel='Rss' href={rssUrl} negative icon={<Rss size={24} />} standAlone />
        </div>
      )
    }
    return
  }

  function renderGlobalLinks() {
    if (globalLinks) {
      return (
        <div className='global-links'>
          {globalLinks.map((globalLink, index) => {
            if (globalLink && globalLink.path && globalLink.title) {
              return (
                <Link key={'link_' + index} href={globalLink.path} negative>
                  {globalLink.title}
                </Link>
              )
            }
            return
          })}
        </div>
      )
    }
    return
  }

  function renderCopyRight() {
    if (copyrightUrl && copyrightText) {
      return (
        <div className='copyright'>
          <Link href={copyrightUrl} isExternal negative>
            {copyrightText}
          </Link>
        </div>
      )
    }
    return
  }

  function goToTop() {
    window.scroll({
      top: 0,
      behavior: 'smooth',
    })
    document.getElementById('header-logo')!.focus({
      preventScroll: true,
    })
  }

  if (logoUrl && footerNavigation && topButtonText) {
    return (
      <div className='ssb-footer-wrapper'>
        <div className='container'>
          <h2 className='sr-only'>{hiddenFooterText}</h2>
          <div className='footer-top-row'>
            <img src={logoUrl} alt='' />
            <Button negative onClick={() => goToTop()}>
              <ArrowUp size='22' className='me-2' />
              {topButtonText}
            </Button>
          </div>
          <div className='footer-content'>
            <nav id='footerMenu' aria-label={footerNavigationLabel}>
              <div className='footer-menu'>{renderFooterMenuDesktop()}</div>
              <div className='showOnMobile footer-menu'>{renderFooterMenuMobile()}</div>
            </nav>
          </div>
          <div className='footer-bottom-row'>
            <div className='links-left'>
              {renderCopyRight()}
              {renderGlobalLinks()}
            </div>
            {renderSocialLinks()}
          </div>
          <div className='showOnMobile footer-bottom-row'>
            {renderSocialLinks()}
            {renderGlobalLinks()}
            {renderCopyRight()}
          </div>
        </div>
      </div>
    )
  }
  return
}

export default (props: FooterContent) => <Footer {...props} />
