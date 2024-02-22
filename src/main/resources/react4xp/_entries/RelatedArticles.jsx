import React, { useState, useRef, useEffect } from 'react'
import { Card, Text, Button } from '@statisticsnorway/ssb-component-library'
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
      currentElement.current && currentElement.current.firstChild.firstChild.focus()
    }
  }, [shownArticles])

  function toggleBox(focus) {
    shownArticles.length < relatedArticles.length ? showMore(focus) : showFewer(focus)
    setIsHidden((prev) => !prev)
  }

  function showMore(focus) {
    if (focus) {
      setFocusElement(true)
    }
    setShownArticles(relatedArticles)
  }

  function showFewer(focus) {
    if (focus) {
      setFocusElement(false)
    }
    setShownArticles(firstShownArticles)
  }

  function renderShowMoreButton() {
    return (
      <div className={`row hide-show-btn justify-content-center justify-content-lg-start`}>
        <div className='col-auto'>
          <Button
            onClick={() => toggleBox(false)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                toggleBox(true)
              }
            }}
            ariaLabel={isHidden ? `${showAllAriaLabel} - ${relatedArticles.length} ${articlePluralName}` : ''}
          >
            {shownArticles.length < relatedArticles.length ? showAll + ` (${relatedArticles.length})` : showLess}
          </Button>
        </div>
      </div>
    )
  }

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
            <li key={index} className={`col-auto col-12 col-lg-4 mb-3`} ref={index === count ? currentElement : null}>
              <Card
                href={article.href}
                imagePlacement='top'
                image={<img src={article.imageSrc} alt={article.imageAlt ?? ''} />}
                title={article.title}
                subTitle={article.subTitle}
                ariaLabel={article.title + ' ' + article.subTitle}
              >
                <Text>{article.preface}</Text>
              </Card>
            </li>
          )
        })}
      </ul>
      {firstShownArticles.length < relatedArticles.length && renderShowMoreButton()}
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
