import React, { useState, useRef, useEffect } from 'react'
import { PictureCard, Button } from '@statisticsnorway/ssb-component-library'
import PropTypes from 'prop-types'
import axios from 'axios'

function RelatedBoxes(props) {
  const {
    firstRelatedContents,
    relatedFactPageServiceUrl,
    partConfig,
    showAll,
    showLess,
    mainTitle,
    showingPhrase,
    factpagePluralName,
  } = props

  const [relatedFactPages, setRelatedFactPages] = useState(
    firstRelatedContents ? firstRelatedContents.relatedFactPages : []
  )
  const [total, setTotal] = useState(firstRelatedContents ? firstRelatedContents.total : 0)
  const [loading, setLoading] = useState(false)
  const [wasClicked, setWasClicked] = useState(false)
  const cards = useRef([])

  useEffect(() => {
    if (cards.current.length > 4 && cards.current[4] && !wasClicked) {
      cards.current[4].focus()
    }
  }, [relatedFactPages])

  function fetchAllRelatedFactPages() {
    setLoading(true)
    axios
      .get(relatedFactPageServiceUrl, {
        params: {
          start: relatedFactPages.length,
          count: total - relatedFactPages.length,
          ...partConfig,
          contentIdList: JSON.stringify(partConfig.contentIdList),
        },
      })
      .then((res) => {
        if (res.data.relatedFactPages.length) {
          setRelatedFactPages((prev) => [...prev, ...res.data.relatedFactPages])
          setTotal(res.data.total)
        }
      })
      .finally(() => {
        setLoading(false)
      })
  }

  function resetRelatedFactPages() {
    setLoading(true)
    setRelatedFactPages(firstRelatedContents.relatedFactPages)
    setTotal(firstRelatedContents.total)
    setLoading(false)
  }

  function handleButtonOnClick(wasClicked) {
    setWasClicked(wasClicked)

    if (total > relatedFactPages.length) {
      fetchAllRelatedFactPages()
    } else {
      resetRelatedFactPages()
    }
  }

  function renderButtonText() {
    if (!loading) {
      if (total > relatedFactPages.length) {
        return `${showAll} (${total})`
      } else {
        return showLess
      }
    } else {
      return <span className='spinner-border spinner-border-sm' />
    }
  }

  function renderRelatedFactPages() {
    if (relatedFactPages.length) {
      return (
        <>
          <div className='row'>
            <ul
              className='image-box-wrapper'
              aria-label={`${showingPhrase.replace('{0}', relatedFactPages.length)} ${total} ${factpagePluralName}`}
            >
              {relatedFactPages.map((relatedFactPageContent, index) => (
                <li key={index}>
                  <PictureCard
                    ref={(element) => (cards.current[index] = element)}
                    className='mb-3'
                    imageSrc={relatedFactPageContent.image}
                    altText={relatedFactPageContent.imageAlt ?? ''}
                    link={relatedFactPageContent.link}
                    title={relatedFactPageContent.title}
                  />
                </li>
              ))}
            </ul>
          </div>
          {total > 4 && (
            <div className='row'>
              <div className='col-auto'>
                <Button
                  ariaLabel={total > relatedFactPages.length && `${showAll} - ${total} ${factpagePluralName}`}
                  onClick={() => handleButtonOnClick(true)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      handleButtonOnClick(false)
                    }
                  }}
                >
                  {renderButtonText()}
                </Button>
              </div>
            </div>
          )}
        </>
      )
    }
  }

  return (
    <div className='container'>
      <h2>{mainTitle}</h2>
      {renderRelatedFactPages()}
    </div>
  )
}

RelatedBoxes.propTypes = {
  firstRelatedContents: PropTypes.shape({
    total: PropTypes.number,
    relatedFactPages: PropTypes.arrayOf(
      PropTypes.shape({
        title: PropTypes.string,
        link: PropTypes.string,
        image: PropTypes.string,
        imageAlt: PropTypes.string,
      })
    ),
  }),
  relatedFactPageServiceUrl: PropTypes.string,
  partConfig: PropTypes.object,
  showAll: PropTypes.string,
  showLess: PropTypes.string,
  mainTitle: PropTypes.string,
  factpagePluralName: PropTypes.string,
  showingPhrase: PropTypes.string,
}

export default (props) => <RelatedBoxes {...props} />
