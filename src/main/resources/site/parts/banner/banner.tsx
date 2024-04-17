import React from 'react'
import { BannerProps } from '../../../lib/types/partTypes/banner'

function Banner(props: BannerProps) {
  const {
    bannerImage,
    bannerImageAltText,
    sizes,
    srcset,
    pageType,
    selectedPageType,
    municipalityTitle,
    pageDisplayName,
    subTitleFactPage,
    factPageTitle,
    fullFactPageTitle,
    generalPageTitle,
    isLandingPage,
    logoUrl,
    logoSrc,
    logoAltText,
  } = props

  return (
    <>
      {bannerImage && (
        <figure className='banner-image position-absolute d-flex justify-content-center'>
          <img className=' d-print-none' sizes={sizes} src={bannerImage} srcSet={srcset} alt={bannerImageAltText} />
        </figure>
      )}
      <div className='container h-100'>
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
          {selectedPageType === 'general' && pageType !== 'municipality' && (
            <>
              {isLandingPage && (
                <div className='col-12 position-relative'>
                  <a href={logoUrl}>
                    <img className='logo' src={logoSrc} alt={logoAltText ? logoAltText : ' '} />
                  </a>
                </div>
              )}
              <div className={`col-12${isLandingPage ? ' landing-page-banner-title' : ''}`}>
                <h1 className='mt-0 pt-0 position-relative'>{generalPageTitle}</h1>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}

export default (props: BannerProps) => <Banner {...props} />
