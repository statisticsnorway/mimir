import React from 'react'
import PropTypes from 'prop-types'
import { Divider, Input, Link, Tabs } from '@statisticsnorway/ssb-component-library'


//const Header = (props) => {
class Header extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      showSubMenu: false
    }
  }

  goToSearchResultPage() {
    window.location = this.props.searchResultPageUrl
  }

  toggleSubMenu() {
    this.setState({showSubMenu: !this.state.showSubMenu})
  }

  render() {
    const {topLinks, language, searchInputPlaceholder, searchResultPageUrl, logoUrl, mainNavigation } = this.props
    return (
      <header className="ssb-header-wrapper">
        <div className="global-links" style={{float: 'right', marginBottom: '12px', marginTop: '10px'}}>
          <nav>
            {topLinks.map((topLink, index) => {
              return (<Link key={'link_' + index} href={topLink.path} style={{marginLeft: '20px'}}>{topLink.title}</Link>)
            })}
            {language.alternativeLanguages.map((altLanguage, index) => {
              return (<Link key={'link_' + index} href={altLanguage.path} style={{marginLeft: '20px'}}>{altLanguage.title}</Link>)
            })}
          </nav>
        </div>
        <div className="top-row flex-row justify-space-between flex-wrap" style={{width: '100%'}}>
          <img src={logoUrl} alt="" style={{width: '248px'}}/>
          <div className="searchfield" style={{width: '285px', alignSelf: 'flex-end'}}>
            <Input ariaLabel="Input field Search" searchField placeholder={searchInputPlaceholder} onKeyPress={() => this.goToSearchResultPage()}/>
          </div>
        </div>
        <div className="header-content" style={{marginBottom: '20px', marginTop: '14px'}}>
          <nav id="mainMenu" className="ssb-tabs">
            {mainNavigation.map((topMenuItem, menuIndex) => (
              <div key={menuIndex} className="tabItem">
                <button className={topMenuItem.isActive? 'active navigation-item' : 'navigation-item'} onClick={() => this.toggleSubMenu()}>
                  <span>{topMenuItem.title}</span>
                </button>
                <Divider/>
                <ol className={this.state.showSubMenu ? 'visible subMenu' : 'subMenu' }>
                  {topMenuItem.menuItems && topMenuItem.menuItems.map((menuItem, itemIndex) => {
                    return (
                      <li key={itemIndex}>
                        <Link clasName="subMenuItem" href={menuItem.path} icon={<img src={menuItem.icon}></img>}>{menuItem.title}</Link>
                      </li>)
                  })
                  }
                </ol>
              </div>
            ))}
          </nav>
        </div>
      </header>
    )
  }
}

Header.propTypes = {
  searchInputPlaceholder: PropTypes.string,
  searchResultPageUrl: PropTypes.string,
  topLinks: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string,
      path: PropTypes.string
    })
  ),
  mainNavigation: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string,
      path: PropTypes.string,
      icon: PropTypes.string,
      isActive: PropTypes.boolean,
      menuItems: PropTypes.arrayOf(
        PropTypes.shape({
          title: PropTypes.string,
          path: PropTypes.string,
          icon: PropTypes.string,
        })
      )
    })
  ),
  logoUrl: PropTypes.string,
  language: PropTypes.shape({
    menuContentId: PropTypes.string,
    code: PropTypes.string,
    alternativeLanguages: PropTypes.arrayOf(
      PropTypes.shape({
        title: PropTypes.string,
        path: PropTypes.string,
        code: PropTypes.string
      })
    )
  })
}

export default (props) => <Header {...props} />
