import React from 'react'
import PropTypes from 'prop-types'
import { Button, Divider, Input, Link, Tabs } from '@statisticsnorway/ssb-component-library'
import { ArrowRight, Facebook, Twitter, Rss, Linkedin } from 'react-feather'

class Footer extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      showSubMenu: false
    }
  }

  render() {
    const {
      logoUrl, mainNavigation
    } = this.props
    return (
      <footer className="ssb-footer-wrapper">
        <div className="top-row flex-row justify-space-between flex-wrap">
          <img src={logoUrl} alt="ssb-logo" style={{
            width: '248px'
          }}/>
          <Button negative onClick={()=> window.scroll({
            top: 0,
            behavior: 'smooth'
          })}> Til Toppen
          </Button>
        </div>

        <div className="footer-content">
          <div id="footerMenu" className="footer-links">
            {mainNavigation.map((topMenuItem, menuIndex) => (
              <div key={menuIndex} className="footer-link">
                <span>{topMenuItem.title}</span>
                <ol className={this.state.showSubMenu ? 'visible subMenu' : 'subMenu' }>
                  {topMenuItem.menuItems && topMenuItem.menuItems.map((menuItem, itemIndex) => {
                    return (
                      <li key={itemIndex}>
                        {/* <Link clasName="subMenuItem" href={menuItem.path} >{menuItem.title}</Link>*/}
                        <Link negative href={menuItem.path} icon={<ArrowRight size="20" />}>{menuItem.title}</Link>

                      </li>)
                  })
                  }
                </ol>
              </div>
            ))}
          </div>
        </div>

        <div className="bottom-row flex-row justify-space-between flex-wrap">
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
