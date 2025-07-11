import React from 'react'
import { Accordion, Button, Link } from '@statisticsnorway/ssb-component-library'
import { ArrowRight, ArrowUp, Facebook, Rss, Linkedin, Instagram } from 'react-feather'
import { type FooterContent } from '/lib/types/footer'
import { type Phrases } from '/lib/types/language'

const Footer = (props: FooterContent) => {
  const {
    logoUrl,
    footerNavigation,
    topButtonText,
    hiddenFooterText,
    language,
    facebookUrl,
    linkedinUrl,
    instagramUrl,
    rssUrl,
    globalLinks,
    copyrightUrl,
    copyrightText,
    isCookiebannerEnabled,
    baseUrl,
  } = props
  const footerNavigationLabel = language?.code === 'en' ? 'footer links' : 'bunnmeny lenker'
  const COOKIE_SERVICE_URL = '/_/service/mimir/setCookieConsent'

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
      })
    )
  }

  function renderSocialLinks() {
    return (
      <div className='social-links'>
        {facebookUrl && (
          <Link ariaLabel='Facebook' href={facebookUrl} isExternal negative icon={<Facebook size={24} />} standAlone />
        )}
        {linkedinUrl && (
          <Link ariaLabel='Linkedin' href={linkedinUrl} isExternal negative icon={<Linkedin size={24} />} standAlone />
        )}
        {instagramUrl && (
          <Link
            ariaLabel='Instagram'
            href={instagramUrl}
            isExternal
            negative
            icon={<Instagram size={24} />}
            standAlone
          />
        )}
        {rssUrl && <Link ariaLabel='Rss' href={rssUrl} negative icon={<Rss size={24} />} standAlone />}
      </div>
    )
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
          })}
        </div>
      )
    }
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
  }

  function renderCookieLinks() {
    const phrases = language?.phrases as Phrases
    const link = `${baseUrl}${language?.code === 'en' ? '/en' : ''}/omssb/personvern`
    if (isCookiebannerEnabled) {
      return (
        <div className='cookie-links'>
          <div className='cookie-link'>
            <Link href={link} negative>
              {phrases.cookiePrivacyLink}
            </Link>
          </div>
          <div className='cookie-reset'>
            <button onClick={handleCookieResetClick} className='ssb-link negative stand-alone'>
              <span className='link-text'>{phrases.cookieResetLink}</span>
            </button>
          </div>
        </div>
      )
    }
    return <></>
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

  async function resetCookieConsent() {
    try {
      await fetch(`${COOKIE_SERVICE_URL}?value=unidentified`, { credentials: 'include' })
    } catch (e) {
      console.error('Failed to reset cookie-consent via service', e)
    }
  }

  function handleCookieResetClick(e: React.MouseEvent<HTMLButtonElement>) {
    resetCookieConsent()
    e.currentTarget.blur()
  }

  if (logoUrl && footerNavigation && topButtonText) {
    return (
      <div className='ssb-footer-wrapper'>
        <div className='container'>
          <h2 className='sr-only'>{hiddenFooterText}</h2>
          <div className='footer-top-row'>
            <img src={logoUrl} alt='' loading='lazy' />
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
          {renderCookieLinks()}
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
}

export default (props: FooterContent) => <Footer {...props} />
