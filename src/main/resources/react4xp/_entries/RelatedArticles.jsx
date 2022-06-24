// import React, { useRef } from 'react'
import React, { useState } from 'react'
import { Card, Text, Button } from '@statisticsnorway/ssb-component-library'
import PropTypes from 'prop-types'

function RelatedArticles(props) {
  const [isHidden, setIsHidden] = useState(true)

  const {
    relatedArticles,
    heading,
    showAll,
    showLess,
    showAllAriaLabel,
    articlePluralName
  } = props

  function toggleBox() {
    setIsHidden(!isHidden)
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
        <div className="col-auto">
          <Button
            onClick={toggleBox}
            ariaLabel={isHidden ? `${showAllAriaLabel} - ${relatedArticles.length} ${articlePluralName}` : ''}
          >
            {isHidden ? showAll + ` (${relatedArticles.length})` : showLess}
          </Button>
        </div>
      </div>
    )
  }

  function getBreakpoints(index, hasButton) {
    const hideCard = hasButton && isHidden ? ' d-none' : ''
    if (index < 3) {
      return ' d-block'
    } else if (index < 4) {
      return ` d-lg-block${hideCard}`
    } else if (index < 6) {
      return ` d-lg-block${hideCard}`
    }
    return hideCard
  }

  // const currentElement = useRef(null)

  const hasButton = showAll && showLess

  return (
    <div className="container">
      <div className="row">
        <h2 className="col mt-4 mb-5">{heading}</h2>
      </div>
      <div role="list" className="row mb-5">
        {relatedArticles.map((article, index) => {
          // const last = index === this.props.relatedArticles.length - relatedArticles.count
          return (
            <div
              role="listitem"
              key={index}
              // ref={last ? currentElement : null}
              // SETT INN REF HER!

              className={`col-auto col-12 col-lg-4 mb-3${getBreakpoints(index, hasButton)}`}
            >
              <Card
                imagePlacement="top"
                image={
                  <img
                    src={article.imageSrc}
                    alt={article.imageAlt ? article.imageAlt : ' '} aria-hidden="true" />
                }
                href={article.href}
                subTitle={article.subTitle}
                title={article.title}
              >
                <Text>
                  {article.preface}
                </Text>
              </Card>
            </div>
          )
        })}
      </div>
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
      imageAlt: PropTypes.string
    })
  ).isRequired,
  showAll: PropTypes.string.isRequired,
  showLess: PropTypes.string.isRequired,
  heading: PropTypes.string.isRequired,
  articlePluralName: PropTypes.string.isRequired,
  showAllAriaLabel: PropTypes.string.isRequired
}

export default (props) => <RelatedArticles {...props} />
