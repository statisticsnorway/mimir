import React from 'react'
import PropTypes from 'prop-types'

function Banner(props) {
  const {
    bannerImage,
    bannerImageAltText,
    sizes,
    srcset,
    selectedPageType,
    municipalityTitle,
    pageDisplayName,
    subTitleFactPage,
    factPageTitle,
    fullFactPageTitle,
    generalPageTitle,
  } = props
  return (
    <>
      {bannerImage && (
        <figure className='banner-image position-absolute d-flex justify-content-center'>
          <img className=' d-print-none' sizes={sizes} src={bannerImage} srcSet={srcset} alt={bannerImageAltText} />
        </figure>
      )}
      <div className='container h-100 d-flex align-items-center'>
        <div className='row'>
          {selectedPageType === 'kommunefakta' && (
            <div className='col-12'>
              <div className='subtitle mb-3 roboto-plain position-relative'>{pageDisplayName}</div>
              {municipalityTitle && <h1 className='mt-0 pt-0 position-relative'>{municipalityTitle}</h1>}
            </div>
          )}

          {selectedPageType === 'faktaside' && (
            <div className='col-12'>
              <div className='subtitle mb-3 roboto-plain position-relative' aria-hidden='true'>
                {subTitleFactPage}
              </div>
              <h1 className='mt-0 pt-0 position-relative' aria-hidden='true'>
                {factPageTitle}
              </h1>
              <div className='sr-only' role='heading' aria-level='1'>
                {fullFactPageTitle}
              </div>
            </div>
          )}

          {selectedPageType === 'general' && (
            <div className='col-12'>
              <h1 className='mt-0 pt-0 position-relative'>{generalPageTitle}</h1>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

Banner.propTypes = {
  bannerImage: PropTypes.string,
  bannerImageAltText: PropTypes.string,
  sizes: PropTypes.string,
  srcset: PropTypes.string,
  selectedPageType: PropTypes.string,
  municipalityTitle: PropTypes.string,
  pageDisplayName: PropTypes.string,
  subTitleFactPage: PropTypes.string,
  factPageTitle: PropTypes.string,
  fullFactPageTitle: PropTypes.string,
  generalPageTitle: PropTypes.string,
}

export default (props) => <Banner {...props} />
