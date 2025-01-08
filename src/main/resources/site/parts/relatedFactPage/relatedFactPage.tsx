import React, { useState } from 'react'
import { PictureCard, Button } from '@statisticsnorway/ssb-component-library'
import axios from 'axios'
import { RelatedFactPageProps } from '/lib/types/partTypes/relatedFactPage'
import { usePagination } from '/lib/ssb/utils/customHooks'

function RelatedBoxes(props: RelatedFactPageProps) {
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

  const { handleKeyboardNavigation, getCurrentElementRef, handleOnClick } = usePagination({
    cardList: true,
    list: relatedFactPages,
    listItemsPerPage: 4,
    onLoadMore: () => handleButtonOnClick(),
  })

  function fetchAllRelatedFactPages() {
    setLoading(true)
    axios
      .get(relatedFactPageServiceUrl, {
        params: {
          start: relatedFactPages.length,
          count: total - relatedFactPages.length,
          ...partConfig,
          contentIdList: JSON.stringify(partConfig?.contentIdList),
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

  function handleButtonOnClick() {
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
              aria-label={`${showingPhrase.replace('{0}', relatedFactPages.length.toString())} ${total} ${factpagePluralName}`}
            >
              {relatedFactPages.map((relatedFactPageContent, index) => (
                <li key={index}>
                  <PictureCard
                    ref={getCurrentElementRef(index)}
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
                  onClick={handleOnClick}
                  onKeyDown={handleKeyboardNavigation}
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

export default (props: RelatedFactPageProps) => <RelatedBoxes {...props} />
