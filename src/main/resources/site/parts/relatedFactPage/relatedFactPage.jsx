import React, { useState } from 'react'
import { PictureCard, Button } from '@statisticsnorway/ssb-component-library'
import PropTypes from 'prop-types'
import { get } from 'axios'

function RelatedBoxes(props) {
  const { firstRelatedContents, relatedFactPageServiceUrl, partConfig, showAll, showLess, mainTitle } = props

  const [relatedFactPages, setRelatedFactPages] = useState(
    firstRelatedContents ? firstRelatedContents.relatedFactPages : []
  )
  const [total, setTotal] = useState(firstRelatedContents ? firstRelatedContents.total : 0)
  const [loading, setLoading] = useState(false)

  function fetchAllRelatedFactPages() {
    setLoading(true)
    get(relatedFactPageServiceUrl, {
      params: {
        start: relatedFactPages.length,
        count: total - relatedFactPages.length,
        partConfig,
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

  function fetchFirstRelatedFactPages() {
    setLoading(true)
    get(relatedFactPageServiceUrl, {
      params: {
        start: 0,
        count: 4,
        partConfig,
      },
    })
      .then((res) => {
        if (res.data.relatedFactPages.length) {
          setRelatedFactPages(res.data.relatedFactPages)
          setTotal(res.data.total)
        }
      })
      .finally(() => {
        setLoading(false)
      })
  }

  function handleButtonOnClick() {
    if (total === relatedFactPages.length) {
      fetchFirstRelatedFactPages()
    } else {
      fetchAllRelatedFactPages()
    }
  }

  function renderRelatedFactPages() {
    if (relatedFactPages.length) {
      return (
        <>
          <div className='row image-box-wrapper'>
            {relatedFactPages.map((relatedFactPageContent, index) => (
              <PictureCard
                className='mb-3'
                imageSrc={relatedFactPageContent.image}
                altText={relatedFactPageContent.imageAlt ? relatedFactPageContent.imageAlt : ''}
                link={relatedFactPageContent.link}
                title={relatedFactPageContent.title}
                key={index}
              />
            ))}
          </div>
          {total > 3 && (
            <div className='row'>
              <div className='col-auto'>
                <Button onClick={handleButtonOnClick}>
                  {!loading ? (
                    total > relatedFactPages.length ? (
                      showAll
                    ) : (
                      showLess
                    )
                  ) : (
                    <span className='spinner-border spinner-border-sm' />
                  )}
                </Button>
              </div>
            </div>
          )}
        </>
      )
    }
    return
  }

  return (
    <div className='container'>
      <h2>{mainTitle}</h2>
      {renderRelatedFactPages()}
    </div>
  )
}

RelatedBoxes.propTypes = {
  firstRelatedContents: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string,
      link: PropTypes.string,
      image: PropTypes.string,
      imageAlt: PropTypes.string,
    })
  ),
  relatedFactPageServiceUrl: PropTypes.string,
  partConfig: PropTypes.string,
  showAll: PropTypes.string,
  showLess: PropTypes.string,
  mainTitle: PropTypes.string,
}

export default (props) => <RelatedBoxes {...props} />
