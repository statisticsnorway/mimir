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
    <a className={`ssb-picture-card vertical ${props.className || ''}`} ref={hoverRef} href={props.href} tabIndex='0'>
      <div className='image-background'>
        <img src={props.imageSrc} alt={props.imageAlt} aria-hidden='true' />
      </div>
      <div className='overlay w-100'>
        <span className='il-title'>{props.title}</span>
        <span className='il-type'>{props.subTitle}</span>
        {hovered ? (
          <ArrowRightCircle className='arrow-icon' size={32} />
        ) : (
          <ArrowRight className='arrow-icon' size={32} />
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
