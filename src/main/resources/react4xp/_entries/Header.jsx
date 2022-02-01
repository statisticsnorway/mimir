import React from 'react'
import PropTypes from 'prop-types'
import { Divider, Input, Link } from '@statisticsnorway/ssb-component-library'
import { ChevronDown, ChevronRight, Menu, X } from 'react-feather'

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
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur()
    mainMenu[index] = !mainMenu[index]

    this.setState({
      showSubMenu: !this.state.showSubMenu || activeIndex !== undefined,
      mainMenu: mainMenu,
      indexForCurrentActiveMenuItem: activeIndex
    })
  }

  menuButtonStatus() {
    const {
      closeText, menuText
    } = this.props
    if (this.state.showMainMenuOnMobile) {
      return (<span>{closeText} <X /></span> )
    } else {
      return (<span>{menuText} <Menu/></span>)
    }
  }
  languageLinks() {
    const {
      alternativeLanguages
    } = this.props.language
    return alternativeLanguages.map((altLanguage, index) => {
      return (<Link title={'language-changer'} key={'link_' + index} href={altLanguage.path}>{altLanguage.title}</Link>)
    })
  }

  renderIcon(icon) {
    return <span dangerouslySetInnerHTML={{
      __html: icon
    }}></span>
  }

  renderSubMenu(topMenuItem, activeMenuItem) {
    return topMenuItem.menuItems && topMenuItem.menuItems.map((menuItem, itemIndex) => {
      return (
        <li key={'listItemLink_' + itemIndex}>
          <Link
            tabIndex={this.state.showSubMenu && activeMenuItem ? 0 : -1 }
            href={menuItem.path}
            icon={ menuItem.iconSvgTag ? this.renderIcon(menuItem.iconSvgTag) : undefined }>{menuItem.title}
          </Link>
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
      searchText, logoUrl, logoSrc, logoAltText, mainNavigation, skipToContentText, language
    } = this.props
    const globalLinksLabel = language.code === 'en' ? 'global links' : 'globale lenker'
    const mainMenuLabel = language.code === 'en' ? 'main menu' : 'hovedmeny'

    return (
      <header className="ssb-header-wrapper">
        <nav className="global-links hideOnMobile" aria-label={globalLinksLabel}>
          <Link className="skip-to-content" href="#content">{skipToContentText}</Link>
          {this.topLinks()}
          {this.languageLinks()}
        </nav>
        <div className="misc top-row flex-row justify-space-between flex-wrap">
          <a id="header-logo" className="plainLink" href={logoUrl}>
            <img src={logoSrc} alt={logoAltText ? logoAltText : ' '} className="logo" />
          </a>

          <button className="hamburger" aria-expanded={this.state.showMainMenuOnMobile ? 'true' : 'false'} onClick={this.toggleMainMenu}>
            {this.menuButtonStatus()}
          </button>

          <div className={this.state.showMainMenuOnMobile ? 'showOnMobile searchfield' : 'hideOnMobile searchfield'} role="search">
            <Input
              id='search_ssb'
              ariaLabel={searchText}
              searchField
              submitCallback={this.goToSearchResultPage}
              placeholder={searchText}
              ariaLabelSearchButton={searchText}
            />
          </div>
        </div>
        <Divider className="mobileMenuDivider" />
        <div className={this.state.showMainMenuOnMobile ? 'showOnMobile header-content' : 'hideOnMobile header-content'}>
          <nav id="mainMenu" className="ssb-tabs" aria-label={mainMenuLabel}>
            <ul className="tabItems">
              {mainNavigation.map((topMenuItem, index) => {
                const menuItemClick = this.toggleSubMenu.bind(this, index)
                const activeMenuItem = this.state.indexForCurrentActiveMenuItem === index ||
                (topMenuItem.isActive && this.state.indexForCurrentActiveMenuItem === undefined)
                return (
                  <li key={index} className={`tabItem${activeMenuItem ? ' activeTab' : ''}`}>
                    <button onClick={menuItemClick} aria-expanded={activeMenuItem ? 'true' : 'false' }>
                      <span className={ activeMenuItem ? 'active navigation-item' : 'navigation-item'} >
                        {activeMenuItem && this.state.showSubMenu ? <ChevronDown size="20" /> : <ChevronRight size="20" />}
                        <span>{topMenuItem.title}</span>
                      </span>
                    </button>
                    <Divider/>
                    <ul className={this.state.showSubMenu ? 'visible subMenu' : 'subMenu' } aria-hidden={activeMenuItem ? 'false' : 'true' }>
                      {this.renderSubMenu(topMenuItem, activeMenuItem)}
                    </ul>
                  </li>
                )
              })}
            </ul>
          </nav>
          <nav className={this.state.showMainMenuOnMobile ? 'active global-bottom-links' : 'global-bottom-links'}
            aria-label={globalLinksLabel}>
            {this.topLinks()}
            {this.languageLinks()}
          </nav>
        </div>
      </header>
    )
  }
}

Header.propTypes = {
  searchText: PropTypes.string,
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
      isActive: PropTypes.bool,
      menuItems: PropTypes.arrayOf(
        PropTypes.shape({
          title: PropTypes.string,
          path: PropTypes.string,
          isActive: PropTypes.bool,
          iconAltText: PropTypes.string,
          iconSvgTag: PropTypes.string
        })
      )
    })
  ),
  logoUrl: PropTypes.string,
  logoSrc: PropTypes.string,
  logoAltText: PropTypes.string,
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
  skipToContentText: PropTypes.string,
  closeText: PropTypes.string,
  menuText: PropTypes.string
}

export default (props) => <Header {...props} />
