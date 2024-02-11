import React from 'react'
import { Accordion, Button, Link } from '@statisticsnorway/ssb-component-library'
import { ArrowRight, ArrowUp, Facebook, Twitter, Rss, Linkedin } from 'react-feather'

interface FooterProps {
  globalLinks?: {
    title?: string;
    path?: string;
  }[];
  footerNavigation?: {
    title?: string;
    path?: string;
    isActive?: boolean;
    menuItems?: {
      title?: string;
      path?: string;
      isActive?: boolean;
    }[];
  }[];
  logoUrl?: string;
  copyrightUrl?: string;
  copyrightText?: string;
  facebookUrl?: string;
  twitterUrl?: string;
  linkedinUrl?: string;
  rssUrl?: string;
  topButtonText?: string;
  hiddenFooterText?: string;
  language?: object;
}

class Footer extends React.Component<FooterProps> {
  constructor(props) {
    super(props)
  }

  renderFooterMenuDesktop(footerNavigation) {
    return footerNavigation.map((topMenuItem, index) => {
      if (topMenuItem && topMenuItem.title) {
        const titleId = topMenuItem.title.replaceAll(' ', '-').toLowerCase()
        const listTitle = `footer-link-title-${titleId}`
        return (
          <div key={index} className='footer-link'>
            <h3 className='ssb-title negative' id={listTitle}>
              {topMenuItem.title}
            </h3>
            <ul aria-labelledby={listTitle}>{this.renderFooterLinkMenu(topMenuItem)}</ul>
          </div>
        )
      }
    })
  }

  renderFooterMenuMobile(footerNavigation) {
    return footerNavigation.map((topMenuItem, index) => {
      if (topMenuItem && topMenuItem.title) {
        const titleId = topMenuItem.title.replaceAll(' ', '-').toLowerCase()
        const listTitle = `footer-mobile-link-title-${titleId}`
        return (
          <Accordion key={index} header={topMenuItem.title}>
            <h3 className='sr-only sr-only-focusable' id={listTitle}>
              {topMenuItem.title}
            </h3>
            <ul aria-labelledby={listTitle}>{this.renderFooterLinkMenu(topMenuItem)}</ul>
          </Accordion>
        )
      }
    })
  }

  renderFooterLinkMenu(topMenuItem) {
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

  renderSocialLinks() {
    const { facebookUrl, twitterUrl, linkedinUrl, rssUrl } = this.props
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
  }

  renderGlobalLinks() {
    const { globalLinks } = this.props
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

  renderCopyRight() {
    const { copyrightUrl, copyrightText } = this.props
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

  goToTop() {
    window.scroll({
      top: 0,
      behavior: 'smooth',
    })
    document.getElementById('header-logo').focus({
      preventScroll: true,
    })
  }

  render() {
    const { logoUrl, footerNavigation, topButtonText, hiddenFooterText, language } = this.props
    const footerNavigationLabel = language.code === 'en' ? 'footer links' : 'bunnmeny lenker'
    if (logoUrl && footerNavigation && topButtonText) {
      return (
        <div className='ssb-footer-wrapper'>
          <div className='container'>
            <h2 className='sr-only'>{hiddenFooterText}</h2>
            <div className='footer-top-row'>
              <img src={logoUrl} alt='' />
              <Button negative onClick={() => this.goToTop()}>
                <ArrowUp size='22' className='me-2' />
                {topButtonText}
              </Button>
            </div>
            <div className='footer-content'>
              <nav id='footerMenu' aria-label={footerNavigationLabel}>
                <div className='footer-menu'>{this.renderFooterMenuDesktop(footerNavigation)}</div>
                <div className='showOnMobile footer-menu'>{this.renderFooterMenuMobile(footerNavigation)}</div>
              </nav>
            </div>
            <div className='footer-bottom-row'>
              <div className='links-left'>
                {this.renderCopyRight()}
                {this.renderGlobalLinks()}
              </div>
              {this.renderSocialLinks()}
            </div>
            <div className='showOnMobile footer-bottom-row'>
              {this.renderSocialLinks()}
              {this.renderGlobalLinks()}
              {this.renderCopyRight()}
            </div>
          </div>
        </div>
      )
    }
  }
}

export default (props) => <Footer {...props} />
