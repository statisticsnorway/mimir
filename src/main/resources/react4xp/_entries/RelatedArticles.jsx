import React, { useState, useRef, useEffect } from 'react'
import PropTypes from 'prop-types'
import { useMediaQuery } from 'react-responsive'

function RelatedArticles(props) {
  const [isHidden, setIsHidden] = useState(true)
  const [focusElement, setFocusElement] = useState(false)
  const currentElement = useRef(null)

  const { relatedArticles, heading, showAll, showLess, showAllAriaLabel, articlePluralName } = props

  const handleMediaQueryChange = (matches) => {
    if (isHidden) {
      matches ? setCount(6) : setCount(3)
    }
  }

  const desktop = useMediaQuery(
    {
      minWidth: 992, // lg breakpoint from bootstrap v.5
    },
    undefined,
    handleMediaQueryChange
  )

  // Props must be assigned to const before we can instantiate this state.
  const [count, setCount] = useState(desktop ? 6 : 3)

  const firstShownArticles = relatedArticles.slice(0, count)
  const [shownArticles, setShownArticles] = useState(relatedArticles.slice(0, 6)) // Default state must be set for related articles to show in edit mode

  useEffect(() => {
    setShownArticles(firstShownArticles)
  }, [count])

  useEffect(() => {
    if (focusElement) {
      currentElement.current.focus()
    }
  }, [shownArticles])

  function toggleBox() {
    isHidden ? showMore() : showFewer()
    setIsHidden((prev) => !prev)
  }

  function showMore() {
    setFocusElement(true)
    setShownArticles(relatedArticles)
  }

  function showFewer() {
    setFocusElement(false)
    setShownArticles(firstShownArticles)
  }

  function getButtonBreakpoints() {
    if (relatedArticles.length > 6) {
      return '' // always display if it's more than 6
    } else if (relatedArticles.length > 4) {
      return ' d-xl-none'
    } else if (relatedArticles.length > 3) {
      return ' d-lg-none'
    }
    return ' d-none' // always hide if there is less than 3
  }

  function renderShowMoreButton() {
    return (
      <div className={`row hide-show-btn justify-content-center justify-content-lg-start${getButtonBreakpoints()}`}>
        <div className='col-auto'>
          <button
            className='ssb-btn'
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                toggleBox()
              }
            }}
            aria-label={isHidden ? `${showAllAriaLabel} - ${relatedArticles.length} ${articlePluralName}` : ''}
          >
            {isHidden ? showAll + ` (${relatedArticles.length})` : showLess}
          </button>
        </div>
      </div>
    )
  }

  const hasButton = showAll && showLess

  return (
    <div className='container'>
      <div className='row'>
        <h2 className='col mt-4 mb-5'>{heading}</h2>
      </div>
      <ul
        className='row mb-5'
        aria-label={`${props.showingPhrase.replace('{0}', shownArticles.length)} ${
          relatedArticles.length
        } ${articlePluralName}`}
      >
        {shownArticles.map((article, index) => {
          return (
            <li key={index} className={`col-auto col-12 col-lg-4 mb-3`}>
              <div className='ssb-card'>
                <a
                  ref={index === count ? currentElement : null}
                  href={article.href}
                  className='clickable top-orientation'
                >
                  <div className='card-image'>
                    <img src={article.imageSrc} alt={article.imageAlt ? article.imageAlt : ' '} aria-hidden='true' />
                  </div>
                  <div className='card-content with-image'>
                    <div className='card-subtitle'>{article.subTitle}</div>
                    <div className='card-title'>{article.title}</div>
                    <span className='ssb-text-wrapper'>{article.preface}</span>
                  </div>
                </a>
              </div>
            </li>
          )
        })}
      </ul>
      {hasButton && renderShowMoreButton()}
    </div>
  )
}

RelatedArticles.propTypes = {
  relatedArticles: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      subTitle: PropTypes.string,
      preface: PropTypes.string,
      href: PropTypes.string.isRequired,
      imageSrc: PropTypes.string.isRequired,
      imageAlt: PropTypes.string,
    })
  ).isRequired,
  showAll: PropTypes.string.isRequired,
  showLess: PropTypes.string.isRequired,
  heading: PropTypes.string.isRequired,
  articlePluralName: PropTypes.string.isRequired,
  showAllAriaLabel: PropTypes.string.isRequired,
  showingPhrase: PropTypes.string,
}

export default (props) => <RelatedArticles {...props} />
