import React, { useState, useCallback, useEffect } from 'react'
import PropTypes from 'prop-types'
import { Divider, Input, Link } from '@statisticsnorway/ssb-component-library'
import { ChevronDown, ChevronRight, Menu, X } from 'react-feather'

function Header(props) {
  const [showSubMenu, setShowSubMenu] = useState(false)
  const [showMainMenuOnMobile, setShowMainMenuOnMobile] = useState(false)
  const [indexForCurrentActiveMenuItem, setIndexForCurrentActiveMenuItem] = useState(undefined)

  function goToSearchResultPage(value) {
    window.location = `${props.searchResultPageUrl}?sok=${value}`
  }

  function toggleMainMenu() {
    setShowMainMenuOnMobile(!showMainMenuOnMobile)
  }

  function toggleSubMenu(index) {
    const activeIndex = indexForCurrentActiveMenuItem === index ? undefined : index

    if (window && window.innerWidth >= 992 && document.activeElement instanceof HTMLElement)
      document.activeElement.focus()

    setShowSubMenu(!showSubMenu || activeIndex !== undefined)
    setIndexForCurrentActiveMenuItem(activeIndex)
  }

  function menuButtonStatus() {
    const { closeText, menuText } = props
    if (showMainMenuOnMobile) {
      return (
        <span>
          {closeText} <X />
        </span>
      )
    } else {
      return (
        <span>
          {menuText} <Menu />
        </span>
      )
    }
  }

  function languageLinks() {
    const { alternativeLanguages } = props.language
    return alternativeLanguages.map((altLanguage, index) => {
      return (
        <Link title={'language-changer'} key={'link_' + index} href={altLanguage.path}>
          {altLanguage.title}
        </Link>
      )
    })
  }

  function renderIcon(icon) {
    return (
      <span
        dangerouslySetInnerHTML={{
          __html: icon,
        }}
      ></span>
    )
  }

  function renderSubMenu(topMenuItem, activeMenuItem) {
    return (
      topMenuItem.menuItems &&
      topMenuItem.menuItems.map((menuItem, itemIndex) => {
        return (
          <li key={'listItemLink_' + itemIndex}>
            <Link
              tabIndex={showSubMenu && activeMenuItem ? 0 : -1}
              href={menuItem.path}
              icon={menuItem.iconSvgTag ? renderIcon(menuItem.iconSvgTag) : undefined}
            >
              {menuItem.title}
            </Link>
          </li>
        )
      })
    )
  }

  function topLinks() {
    return props.topLinks.map((topLink, index) => {
      return (
        <Link key={'link_' + index} href={topLink.path}>
          {topLink.title}
        </Link>
      )
    })
  }

  // CLOSE submenu when esc key is pressed
  const escKeyListener = useCallback(
    (event) => {
      if (event.keyCode === 27 || event.key == 'Escape') {
        if (window && window.innerWidth >= 992 && document.activeElement instanceof HTMLElement)
          document.activeElement.blur()

        setShowSubMenu(false)
        const activeMenuButton = document.getElementById(indexForCurrentActiveMenuItem)
        activeMenuButton.focus()
        setIndexForCurrentActiveMenuItem(undefined)
      }
    },
    [indexForCurrentActiveMenuItem]
  )

  useEffect(() => {
    document.addEventListener('keydown', escKeyListener, false)

    return () => {
      document.removeEventListener('keydown', escKeyListener, false)
    }
  }, [indexForCurrentActiveMenuItem])

  const {
    searchText,
    mainMenuText,
    logoUrl,
    logoSrc,
    logoAltText,
    mainNavigation,
    skipToContentText,
    language,
    searchResult,
  } = props

  const globalLinksLabel = language.code === 'en' ? 'global links' : 'globale lenker'
  const mainMenuLabel = language.code === 'en' ? 'main menu' : 'hovedmeny'

  return (
    <header className='ssb-header-wrapper'>
      <nav className='global-links hideOnMobile' aria-label={globalLinksLabel}>
        <Link className='skip-to-content' href='#content'>
          {skipToContentText}
        </Link>
        {topLinks()}
        {languageLinks()}
      </nav>
      <div className='misc top-row flex-row justify-space-between flex-wrap'>
        <a id='header-logo' className='plainLink' href={logoUrl}>
          <img src={logoSrc} alt={logoAltText ? logoAltText : ' '} className='logo' />
        </a>

        <button
          className='hamburger'
          aria-expanded={showMainMenuOnMobile ? 'true' : 'false'}
          onClick={() => toggleMainMenu()}
        >
          {menuButtonStatus()}
        </button>

        {!searchResult ? (
          <div className={showMainMenuOnMobile ? 'showOnMobile searchfield' : 'hideOnMobile searchfield'}>
            <Input
              id='search_ssb'
              ariaLabel={searchText}
              searchField
              submitCallback={goToSearchResultPage}
              placeholder={searchText}
              ariaLabelSearchButton={searchText}
              ariaLabelWrapper={mainMenuText}
            />
          </div>
        ) : null}
      </div>
      <Divider className={showMainMenuOnMobile ? 'd-none' : 'mobileMenuDivider'} />
      <div className={showMainMenuOnMobile ? 'showOnMobile header-content' : 'hideOnMobile header-content'}>
        <nav id='mainMenu' className='ssb-tabs' aria-label={mainMenuLabel}>
          <ul className='tabItems'>
            {mainNavigation.map((topMenuItem, index) => {
              const activeMenuItem =
                indexForCurrentActiveMenuItem === index ||
                (topMenuItem.isActive && indexForCurrentActiveMenuItem === undefined)
              return (
                <li key={index} className={`tabItem${activeMenuItem ? ' activeTab' : ''}`}>
                  <button
                    onClick={() => toggleSubMenu(index)}
                    aria-expanded={activeMenuItem ? 'true' : 'false'}
                    id={index}
                  >
                    <span className={activeMenuItem ? 'active navigation-item' : 'navigation-item'}>
                      {activeMenuItem && showSubMenu ? <ChevronDown size='20' /> : <ChevronRight size='20' />}
                      <span>{topMenuItem.title}</span>
                    </span>
                  </button>
                  <Divider />
                  <ul
                    className={showSubMenu ? 'visible subMenu' : 'subMenu'}
                    aria-hidden={activeMenuItem ? 'false' : 'true'}
                  >
                    {renderSubMenu(topMenuItem, activeMenuItem)}
                  </ul>
                </li>
              )
            })}
          </ul>
        </nav>
        <nav
          className={showMainMenuOnMobile ? 'active global-bottom-links' : 'global-bottom-links'}
          aria-label={globalLinksLabel}
        >
          {topLinks()}
          {languageLinks()}
        </nav>
      </div>
    </header>
  )
}

Header.propTypes = {
  searchText: PropTypes.string,
  searchResultPageUrl: PropTypes.string,
  topLinks: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string,
      path: PropTypes.string,
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
          iconSvgTag: PropTypes.string,
        })
      ),
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
        code: PropTypes.string,
      })
    ),
  }),
  skipToContentText: PropTypes.string,
  closeText: PropTypes.string,
  menuText: PropTypes.string,
  mainMenuText: PropTypes.string,
  searchResult: PropTypes.string,
}

export default (props) => <Header {...props} />
