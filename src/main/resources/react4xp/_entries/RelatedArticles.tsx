import React, { useState, useRef, useEffect } from 'react'
import { Card, Text, Button } from '@statisticsnorway/ssb-component-library'
import { useMediaQuery } from 'react-responsive'
import { type RelatedArticlesContent } from '/lib/types/partTypes/relatedArticles'
import { usePaginationKeyboardNavigation } from '/lib/ssb/utils/customHooks/paginationHooks'
import { sanitize } from '/lib/ssb/utils/htmlUtils'

interface RelatedArticlesProps {
  relatedArticles: RelatedArticlesContent[]
  showAll: string
  showLess: string
  heading: string
  articlePluralName: string
  showAllAriaLabel: string
  showingPhrase: string
}

function RelatedArticles(props: RelatedArticlesProps) {
  const [isHidden, setIsHidden] = useState(true)
  const [focusElement, setFocusElement] = useState(false)
  const currentElement = useRef<null | HTMLLIElement>(null)

  const { relatedArticles, heading, showAll, showLess, showAllAriaLabel, articlePluralName } = props

  const handleMediaQueryChange = (matches: boolean) => {
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
    if (focusElement && currentElement.current) {
      const focusable = currentElement.current.firstChild?.firstChild as HTMLAnchorElement
      focusable.focus()
    }
  }, [shownArticles])

  function toggleBox(focus: boolean) {
    shownArticles.length < relatedArticles.length ? showMore(focus) : showFewer(focus)
    setIsHidden((prev) => !prev)
  }

  function showMore(focus: boolean) {
    if (focus) {
      setFocusElement(true)
    }
    setShownArticles(relatedArticles)
  }

  function showFewer(focus: boolean) {
    if (focus) {
      setFocusElement(false)
    }
    setShownArticles(firstShownArticles)
  }

  // TODO: Implement custom hook for pagination after changes has been made to support ref prop for Card component
  const handleKeyboardNavigation = usePaginationKeyboardNavigation(() => toggleBox(true))

  function renderShowMoreButton() {
    return (
      <div className={`row hide-show-btn justify-content-center justify-content-lg-start`}>
        <div className='col-auto'>
          <Button
            onClick={() => toggleBox(false)}
            onKeyDown={handleKeyboardNavigation}
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
        aria-label={`${props.showingPhrase.replace('{0}', shownArticles.length.toString())} ${
          relatedArticles.length
        } ${articlePluralName}`}
      >
        {shownArticles.map((article, index) => {
          const { href, imageSrc, imageAlt, title, subTitle, preface, ariaLabel } = article
          return (
            <li key={index} className={`col-auto col-12 col-lg-4 mb-3`} ref={index === count ? currentElement : null}>
              <Card
                href={href}
                imagePlacement='top'
                image={<img src={imageSrc} alt={imageAlt ?? ''} loading='lazy' />}
                title={title}
                subTitle={subTitle}
                ariaLabel={ariaLabel}
              >
                <Text>
                  <span dangerouslySetInnerHTML={{ __html: sanitize(preface) }} />
                </Text>
              </Card>
            </li>
          )
        })}
      </ul>
      {firstShownArticles.length < relatedArticles.length && renderShowMoreButton()}
    </div>
  )
}

export default (props: RelatedArticlesProps) => <RelatedArticles {...props} />
