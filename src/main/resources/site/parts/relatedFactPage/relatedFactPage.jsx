import React, { useState } from 'react'
import { PictureCard, Button } from '@statisticsnorway/ssb-component-library'
import PropTypes from 'prop-types'
import { get } from 'axios'

function RelatedBoxes(props) {
  const {
    firstRelatedContents,
    relatedFactPageServiceUrl,
    partConfig,
    language,
    showAll,
    showLess,
    mainTitle
  } = props

  const [relatedContents, setRelatedContents] = useState(firstRelatedContents.relatedContents)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)

  function fetchRelatedFactPages() {
    setLoading(true)
    get(relatedFactPageServiceUrl, {
      params: {
        start: relatedContents.length,
        count: 4, // TODO: 3 for mobile
        language: language,
        partConfig: partConfig
      }
    }).then((res) => {
      if (res.data.articles.length) {
        setRelatedContents((prev) => [...prev, ...res.data.relatedContents])
        setTotal(res.data.total)
      }
    })
      .finally(() => {
        setLoading(false)
      })
  }

  return (
    <div className="container">
      <h2>{mainTitle}</h2>
      <div className="row image-box-wrapper">
        {!loading && relatedContents.map((relatedRelatedContent, index) =>
          <PictureCard
            // className={`mb-3 ${index > 3 && isHidden ? 'd-none' : ''}`}
            className="mb-3"
            imageSrc={relatedRelatedContent.image}
            altText={relatedRelatedContent.imageAlt ? relatedRelatedContent.imageAlt : ' '}
            link={relatedRelatedContent.link}
            title={relatedRelatedContent.title}
            key={index}
          />
        )}
      </div>
      {/* <div className={`row hide-show-btn ${relatedContents.length < 5 ? 'd-none' : ''}`}> */}
      <div className="row">
        <div className="col-auto">
          <Button onClick={fetchRelatedFactPages}>{total === relatedContents.length ? showAll : showLess}</Button>
        </div>
      </div>
    </div>
  )
}

RelatedBoxes.propTypes = {
  firstRelatedContents: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string,
      link: PropTypes.string,
      image: PropTypes.string,
      imageAlt: PropTypes.string
    })
  ),
  relatedFactPageServiceUrl: PropTypes.string,
  partConfig: PropTypes.string,
  language: PropTypes.string,
  showAll: PropTypes.string,
  showLess: PropTypes.string,
  mainTitle: PropTypes.string
}

export default (props) => <RelatedBoxes {...props} />
