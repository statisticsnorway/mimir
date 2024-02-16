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
  const [interactionType, setInteractionType] = useState('')
  const [isReset, setIsReset] = useState(false)
  const itemRefs = useRef([])

  useEffect(() => {
    if (interactionType === 'key' && !isReset && relatedFactPages.length > 0) {
      const newElementIndex = firstRelatedContents ? firstRelatedContents.relatedFactPages.length : 0
      const firstNewElement = itemRefs.current[newElementIndex]
      if (firstNewElement) {
        const focusableElement = firstNewElement.querySelector('a')
        if (focusableElement) {
          focusableElement.focus()
        }
      }
    }
    setIsReset(false)
  }, [relatedFactPages.length, interactionType, isReset])

  useEffect(() => {
    itemRefs.current = itemRefs.current.slice(0, relatedFactPages.length)
  }, [relatedFactPages.length])

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
    setRelatedFactPages(firstRelatedContents ? firstRelatedContents.relatedFactPages : [])
    setTotal(firstRelatedContents ? firstRelatedContents.total : 0)
    setIsReset(true)
    setLoading(false)
  }

  function handleButtonClick(eventType) {
    setInteractionType(eventType)
    if (total > relatedFactPages.length) {
      fetchAllRelatedFactPages()
    } else {
      resetRelatedFactPages()
    }
  }

  function renderRelatedFactPages() {
    return relatedFactPages.length ? (
      <>
        <div className='row'>
          <ul
            className='image-box-wrapper'
            aria-label={`${showingPhrase.replace('{0}', relatedFactPages.length)} ${total} ${factpagePluralName}`}
          >
            {relatedFactPages.map((relatedFactPageContent, index) => (
              <li key={index} ref={(el) => (itemRefs.current[index] = el)}>
                <PictureCard
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
                ariaLabel={total > relatedFactPages.length ? `${showAll} - ${total} ${factpagePluralName}` : ''}
                onClick={() => handleButtonClick('click')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    handleButtonClick('key')
                  }
                }}
              >
                {loading ? (
                  <span className='spinner-border spinner-border-sm' />
                ) : total > relatedFactPages.length ? (
                  `${showAll} (${total})`
                ) : (
                  showLess
                )}
              </Button>
            </div>
          </div>
        )}
      </>
    ) : null
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
