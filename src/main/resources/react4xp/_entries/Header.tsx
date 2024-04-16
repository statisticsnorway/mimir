import React, { useState, useCallback, useEffect } from 'react'
import { Divider, Input, Link } from '@statisticsnorway/ssb-component-library'
import { ChevronDown, ChevronRight, Menu, X } from 'react-feather'
import { sanitize } from '../../lib/ssb/utils/htmlUtils'
import { HeaderContent } from '../../lib/types/header'

function Header(props: HeaderContent) {
  const [showSubMenu, setShowSubMenu] = useState(false)
  const [showMainMenuOnMobile, setShowMainMenuOnMobile] = useState(false)
  const [indexForCurrentActiveMenuItem, setIndexForCurrentActiveMenuItem] = useState<number | undefined>(undefined)

  function goToSearchResultPage(value: string) {
    window.location.href = `${props.searchResultPageUrl}?sok=${value}`
  }

  function toggleMainMenu() {
    setShowMainMenuOnMobile(!showMainMenuOnMobile)
  }

  function toggleSubMenu(index: number) {
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
    const { alternativeLanguages } = props.language!
    return alternativeLanguages?.map((altLanguage, index) => {
      return (
        <Link title={'language-changer'} key={'link_' + index} href={altLanguage.path} standAlone>
          {altLanguage.title}
        </Link>
      )
    })
  }

  function renderIcon(icon: string) {
    return (
      <span
        className='icon'
        aria-hidden='true'
        dangerouslySetInnerHTML={{
          __html: sanitize(icon),
        }}
      ></span>
    )
  }

  function renderSubMenu(topMenuItem: HeaderContent['mainNavigation'][0], activeMenuItem: boolean | undefined) {
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
    return props.topLinks?.map((topLink, index) => {
      return (
        <Link key={'link_' + index} href={topLink.path} standAlone>
          {topLink.title}
        </Link>
      )
    })
  }

  // CLOSE submenu when esc key is pressed
  const escKeyListener = useCallback(
    (event: KeyboardEvent) => {
      if (event.keyCode === 27 || event.key == 'Escape') {
        if (window && window.innerWidth >= 992 && document.activeElement instanceof HTMLElement)
          document.activeElement.blur()

        setShowSubMenu(false)
        const activeMenuButton = document.getElementById(indexForCurrentActiveMenuItem as string) as HTMLButtonElement
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

  const globalLinksLabel = language?.code === 'en' ? 'global links' : 'globale lenker'
  const mainMenuLabel = language?.code === 'en' ? 'main menu' : 'hovedmeny'

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
          <div className={showMainMenuOnMobile ? 'fill-width hideOnMobile' : ' fill-width'}>
            <Divider />
          </div>
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

export default (props: HeaderContent) => <Header {...props} />
