import React from 'react'
import PropTypes from 'prop-types'
import { Divider, Input, Link } from '@statisticsnorway/ssb-component-library'
import { ChevronDown, ChevronUp, Menu, X } from 'react-feather'

class Header extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      showSubMenu: false,
      showMainMenuOnMobile: false,
      searchFieldInput: '',
      mainMenu: props.mainNavigation.map( () => false ),
      indexForCurrentActiveMenuItem: undefined
    }

    this.goToSearchResultPage = this.goToSearchResultPage.bind(this)
    this.languageLinks = this.languageLinks.bind(this)
    this.renderSubMenu = this.renderSubMenu.bind(this)
    this.toggleMainMenu = this.toggleMainMenu.bind(this)
    this.toggleSubMenu = this.toggleSubMenu.bind(this)
    this.topLinks = this.topLinks.bind(this)
  }

  goToSearchResultPage(value) {
    window.location = `${this.props.searchResultPageUrl}?sok=${value}`
  }

  toggleMainMenu() {
    this.setState({
      showMainMenuOnMobile: !this.state.showMainMenuOnMobile
    })
  }

  toggleSubMenu(index) {
    const activeIndex = this.state.indexForCurrentActiveMenuItem === index ? undefined : index
    const mainMenu = [...this.state.mainMenu]
    mainMenu[index] = !mainMenu[index]

    this.setState({
      showSubMenu: !this.state.showSubMenu || activeIndex !== undefined,
      mainMenu: mainMenu,
      indexForCurrentActiveMenuItem: activeIndex
    })
  }

  menuButtonStatus() {
    if (this.state.showMainMenuOnMobile) {
      return (<span>Lukk <X /></span> )
    } else {
      return (<span>Meny <Menu/></span>)
    }
  }
  languageLinks() {
    return this.props.language.alternativeLanguages.map((altLanguage, index) => {
      return (<Link key={'link_' + index} href={altLanguage.path}>{altLanguage.title}</Link>)
    })
  }
  renderSubMenu(topMenuItem) {
    return topMenuItem.menuItems && topMenuItem.menuItems.map((menuItem, itemIndex) => {
      return (
        <li key={'listItemLink_' + itemIndex}>
          <Link href={menuItem.path} icon={ menuItem.icon ? <img src={menuItem.icon}></img> : undefined }>{menuItem.title}</Link>
        </li>)
    })
  }

  topLinks() {
    return this.props.topLinks.map((topLink, index) => {
      return (<Link key={'link_' + index} href={topLink.path}>{topLink.title}</Link>)
    })
  }


  render() {
    const {
      searchInputPlaceholder, logoUrl, mainNavigation, skipToContentText
    } = this.props
    return (
      <header className="ssb-header-wrapper">
        <nav className="global-links">
          <a id="skip-to-content" className="ssb-link" href="#content" tabIndex="1" accessKey="s">
            <span className="link-text">{skipToContentText}</span>
          </a>
          {this.topLinks()}
          {this.languageLinks()}
        </nav>
        <div className="misc top-row flex-row justify-space-between flex-wrap">
          <a className="plainLink" href="/">
            <img src={logoUrl} alt="" className="logo" />
          </a>

          <button className="hamburger" onClick={this.toggleMainMenu}>
            {this.menuButtonStatus()}
          </button>

          <div className={this.state.showMainMenuOnMobile ? 'show searchfield' : 'searchfield'}>
            <Input
              ariaLabel={searchInputPlaceholder}
              searchField
              submitCallback={this.goToSearchResultPage}
              placeholder={searchInputPlaceholder} />
          </div>
        </div>
        <Divider className="mobileMenuDivider" />
        <div className={this.state.showMainMenuOnMobile ? 'showOnMobile header-content' : 'header-content'}>
          <nav id="mainMenu" className="ssb-tabs">
            {mainNavigation.map((topMenuItem, index) => {
              const menuItemClick = this.toggleSubMenu.bind(this, index)
              const activeMenuItem = this.state.indexForCurrentActiveMenuItem === index || topMenuItem.isActive
              return (
                <div key={index} className={`tabItem${activeMenuItem ? ' activeTab' : ''}`}>
                  <button onClick={menuItemClick} >
                    <span className={ activeMenuItem ? 'active navigation-item' : 'navigation-item'} >
                      <span>{topMenuItem.title}</span>
                      {this.state.mainMenu[index] ? <ChevronUp/> : <ChevronDown/>}
                    </span>
                  </button>
                  <Divider/>
                  <ol className={this.state.showSubMenu ? 'visible subMenu' : 'subMenu' }>
                    {this.renderSubMenu(topMenuItem)}
                  </ol>
                </div>
              )
            })}
          </nav>
          <nav className={this.state.showMainMenuOnMobile ? 'active global-bottom-links' : 'global-bottom-links'}>
            {this.topLinks()}
            {this.languageLinks()}
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
          icon: PropTypes.string
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
  }),
  skipToContentText: PropTypes.string
}

export default (props) => <Header {...props} />
