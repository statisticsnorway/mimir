import React, { useRef, useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { ArrowRight, ArrowRightCircle } from 'react-feather'

function useHover() {
  const [value, setValue] = useState(false)

  const hoverRef = useRef(null)

  useEffect(
    // eslint-disable-next-line consistent-return
    () => {
      const handleMouseOver = () => setValue(true)
      const handleMouseOut = () => setValue(false)
      const element = hoverRef && hoverRef.current

      if (element) {
        element.addEventListener('mouseover', handleMouseOver)
        element.addEventListener('mouseout', handleMouseOut)
        return () => {
          element.removeEventListener('mouseover', handleMouseOver)
          element.removeEventListener('mouseout', handleMouseOut)
        }
      }
    },
    [hoverRef]
  )

  return [hoverRef, value]
}

const PictureLink = (props) => {
  const [hoverRef, hovered] = useHover()
  return (
    <a
      className={`ssb-picture-card vertical ${props.className || ''}`}
      ref={hoverRef}
      href={props.href}
      aria-label={props.title}
      aria-describedby={props.ariaDescribedBy ? `${props.id}-${props.ariaDescribedBy}` : undefined}
    >
      <div className='image-background'>
        <img src={props.imageSrc} alt={props.imageAlt} aria-hidden='true' height={400} loading='lazy' />
      </div>
      <div className='overlay w-100'>
        <span className='il-title'>{props.title}</span>
        <span className='il-type' id={`${props.id}-text`}>
          {props.subTitle}
        </span>
        {hovered ? (
          <ArrowRightCircle className='arrow-icon' size={32} aria-hidden='true' />
        ) : (
          <ArrowRight className='arrow-icon' size={32} aria-hidden='true' />
        )}
      </div>
    </a>
  )
}

PictureLink.propTypes = {
  title: PropTypes.string,
  subTitle: PropTypes.string,
  href: PropTypes.string,
  imageSrc: PropTypes.string,
  imageAlt: PropTypes.string,
  className: PropTypes.string,
  id: PropTypes.string,
  ariaDescribedBy: PropTypes.string,
}

const PictureCardLinks = (props) => {
  function getColSize(length, index) {
    if (length === 2 || (length === 3 && index === 0)) return 'col-md-6'
    if (length === 3 && index > 0) return 'col-md-3'
    return 'col-md-3'
  }

  return (
    <div className='row'>
      {props.pictureCardLinks.map((pictureCard, index) => {
        return (
          <div
            key={`picture-card-link-${props.react4xpId}-${index}`}
            className={getColSize(props.pictureCardLinks.length, index) + ' col-12 mb-4 mb-md-0'}
          >
            <PictureLink
              className='w-100'
              title={pictureCard.title}
              subTitle={pictureCard.subTitle}
              href={pictureCard.href}
              imageSrc={pictureCard.imageSrc}
              imageAlt={pictureCard.imageAlt}
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

PictureCardLinks.propTypes = {
  pictureCardLinks: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string,
      subTitle: PropTypes.string,
      href: PropTypes.string,
      imageSrc: PropTypes.string,
      imageAlt: PropTypes.string,
    })
  ),
  react4xpId: PropTypes.string,
}

export default (props) => <PictureCardLinks {...props} />
