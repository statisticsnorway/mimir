import React from 'react'
import PropTypes from 'prop-types'
import { Button, Link, Title } from '@statisticsnorway/ssb-component-library'
import { ArrowRight, ArrowUp, Facebook, Twitter, Rss, Linkedin } from 'react-feather'

class Footer extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    const {
      logoUrl, mainNavigation
    } = this.props
    return (
      <footer className="ssb-footer-wrapper">
        <div className="footer-top-row container">
          <img src={logoUrl} alt="ssb-logo"/>
          <Button negative onClick={()=> window.scroll({
            top: 0,
            behavior: 'smooth'
          })}><ArrowUp size="18" className="mr-2" />Til Toppen
          </Button>
        </div>

        <div className="footer-content container">
          <div id="footerMenu" className="footer-links">
            {mainNavigation.map((topMenuItem, menuIndex) => (
              <div key={menuIndex} className="footer-link">
                <Title size={4} negative>{topMenuItem.title}</Title>
                <ol>
                  {topMenuItem.menuItems && topMenuItem.menuItems.map((menuItem, itemIndex) => {
                    return (
                      <li key={itemIndex}>
                        <Link negative href={menuItem.path} icon={<ArrowRight size="20" />}>{menuItem.title}</Link>
                      </li>)
                  })
                  }
                </ol>
              </div>
            ))}
          </div>
        </div>

        <div className="footer-bottom-row container">
          <div className="global-links">
            <Link href="https://www.ssb.no/" isExternal negative>Statistisk sentralbyrå © 2019</Link>
            <Link href="https://www.ssb.no/a-aa" isExternal negative>A-Å</Link>
            <Link href="https://www.ssb.no/nettstedskart" isExternal negative>Nettstedskart</Link>
          </div>
          <div className="social-links">
            <Link href="https://www.facebook.com/statistisksentralbyra/" isExternal negative icon={<Facebook size={24} />} />
            <Link href="https://twitter.com/ssbnytt" isExternal negative icon={<Twitter size={24} />} />
            <Link href="https://www.linkedin.com/company/statistics-norway/" isExternal negative icon={<Linkedin size={24} />} />
            <Link href="https://www.ssb.no/informasjon/rss" isExternal negative icon={<Rss size={24} />} />
          </div>
        </div>
      </footer>
    )
  }
}

Footer.propTypes = {
  mainNavigation: PropTypes.arrayOf(
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
  logoUrl: PropTypes.string
}

export default (props) => <Footer {...props} />
