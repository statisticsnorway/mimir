import React from 'react'
import PropTypes from 'prop-types'
import { Accordion, Button, Divider, Link, Title } from '@statisticsnorway/ssb-component-library'
import { ArrowRight, ArrowUp, Facebook, Twitter, Rss, Linkedin, ChevronUp, ChevronDown } from 'react-feather'

class Footer extends React.Component {
  constructor(props) {
    super(props)
  }

  renderFooterMenuDesktop(footerNavigation) {
    return footerNavigation.map((topMenuItem, index) => {
      return (
        <div key={index} className="footer-link">
          <Title size={4} negative>{topMenuItem.title}</Title>
          <ol>
            {this.renderFooterLinkMenu(topMenuItem)}
          </ol>
        </div>)
    })
  }

  renderFooterMenuMobile(footerNavigation) {
    return footerNavigation.map((topMenuItem, index) => {
      return (
        <Accordion key={index} header={topMenuItem.title}>
          <ol>
            {this.renderFooterLinkMenu(topMenuItem)}
          </ol>
        </Accordion>)
    })
  }

  renderFooterLinkMenu(topMenuItem) {
    return topMenuItem.menuItems && topMenuItem.menuItems.map((menuItem, itemIndex) => {
      return (
        <li key={itemIndex}>
          <Link negative href={menuItem.path} icon={<ArrowRight size="20" />}>{menuItem.title}</Link>
        </li>)
    })
  }

  renderSocialLinks() {
    const {
      facebookUrl, twitterUrl, linkedinUrl, rssUrl
    } = this.props
    return (
      <div className="social-links">
        <Link href={facebookUrl} isExternal negative icon={<Facebook size={24} />} />
        <Link href={twitterUrl} isExternal negative icon={<Twitter size={24} />} />
        <Link href={linkedinUrl} isExternal negative icon={<Linkedin size={24} />} />
        <Link href={rssUrl} negative icon={<Rss size={24} />} />
      </div>)
  }

  renderGlobalLinks() {
    const {
      globalLinks
    } = this.props
    return (
      <div className="global-links">
        {globalLinks.map((globalLink, index) => {
          return (<Link key={'link_' + index} href={globalLink.path} negative>{globalLink.title}</Link>)
        })}
      </div>)
  }

  render() {
    const {
      logoUrl, footerNavigation, topButtonText
    } = this.props
    return (
      <footer className="ssb-footer-wrapper">
        <div className="container">
          <div className="footer-top-row">
            <img src={logoUrl} alt="ssb-logo"/>
            <Button negative onClick={()=> window.scroll({
              top: 0,
              behavior: 'smooth'
            })}>
              <ArrowUp size="22" className="mr-2" />
              {topButtonText}
            </Button>
          </div>
          <div className="footer-content">
            <nav id="footerMenu">
              <div className="footer-menu">
                {this.renderFooterMenuDesktop(footerNavigation)}
              </div>
              <div className="showOnMobile footer-menu">
                {this.renderFooterMenuMobile(footerNavigation)}
              </div>
            </nav>
          </div>
          <div className="footer-bottom-row">
            {this.renderGlobalLinks()}
            {this.renderSocialLinks()}
          </div>
          <div className="showOnMobile footer-bottom-row">
            {this.renderSocialLinks()}
            {this.renderGlobalLinks()}
          </div>
        </div>
      </footer>
    )
  }
}

Footer.propTypes = {
  globalLinks: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string,
      path: PropTypes.string
    })
  ),
  footerNavigation: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string,
      path: PropTypes.string,
      icon: PropTypes.string,
      menuItems: PropTypes.arrayOf(
        PropTypes.shape({
          title: PropTypes.string,
          path: PropTypes.string,
          icon: PropTypes.string
        })
      )
    })
  ),
  logoUrl: PropTypes.string,
  facebookUrl: PropTypes.string,
  twitterUrl: PropTypes.string,
  linkedinUrl: PropTypes.string,
  rssUrl: PropTypes.string,
  topButtonText: PropTypes.string
}

export default (props) => <Footer {...props} />
