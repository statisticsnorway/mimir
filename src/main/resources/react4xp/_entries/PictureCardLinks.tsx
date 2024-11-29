import React from 'react'
import { ArrowRight, ArrowRightCircle } from 'react-feather'
import { type ImageUrls, type PictureCardLinksContent } from '/lib/types/partTypes/pictureCardLinks'

interface PictureLinkProps {
  title?: string
  subTitle?: string
  href?: string
  imageSources: ImageUrls
  className?: string
  id?: string
  ariaDescribedBy?: string
}

const PictureLink = ({ href, title, subTitle, id, ariaDescribedBy, className, imageSources }: PictureLinkProps) => {
  return (
    <a
      className={`ssb-picture-card vertical ${className || ''} group`}
      href={href}
      aria-label={title}
      aria-describedby={ariaDescribedBy ? `${id}-${ariaDescribedBy}` : undefined}
    >
      <div className='image-background'>
        <picture>
          <source srcSet={imageSources.landscapeSrcSet} media='(max-width: 767px)' />
          {imageSources.portraitSrcSet && <source srcSet={imageSources.portraitSrcSet} media='(min-width: 768px)' />}
          <img src={imageSources.imageSrc} alt={imageSources.imageAlt} aria-hidden='true' height={400} loading='lazy' />
        </picture>
      </div>
      <div className='overlay w-100'>
        <span className='il-title'>{title}</span>
        <span className='il-type' id={`${id}-text`}>
          {subTitle}
        </span>
        <ArrowRightCircle className='arrow-icon icon-circle' size={32} aria-hidden='true' />
        <ArrowRight className='arrow-icon icon' size={32} aria-hidden='true' />
      </div>
    </a>
  )
}

interface PictureCardLinksProps {
  pictureCardLinks: PictureCardLinksContent[]
}

const PictureCardLinks = ({ pictureCardLinks }: PictureCardLinksProps) => {
  function getColSize(length: number, index: number) {
    if (length === 2 || (length === 3 && index === 0)) return 'col-md-6'
    if (length === 3 && index > 0) return 'col-md-3'
    return 'col-md-3'
  }

  return (
    <div className='row'>
      {pictureCardLinks.map((pictureCard, index) => {
        return (
          <div
            key={`picture-card-link-${index}`}
            className={getColSize(pictureCardLinks.length, index) + ' col-12 mb-4 mb-md-0'}
          >
            <PictureLink
              className='w-100'
              title={pictureCard.title}
              subTitle={pictureCard.subTitle}
              href={pictureCard.href}
              imageSources={pictureCard.imageSources}
              id={index.toString()}
              ariaDescribedBy='text'
            />
          </div>
        )
      })}
    </div>
  )
}

PictureCardLinks.defaultProps = {
  pictureCardLinks: [],
}

export default (props: PictureCardLinksProps) => <PictureCardLinks {...props} />
