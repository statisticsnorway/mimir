import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { ArrowRight } from 'react-feather'

function FrontpageKeyfigures(props) {
  function createRows() {
    const keyFigures = props.keyFigures
    const { width } = useWindowDimensions()

    return keyFigures.map((keyFigure, i) => {
      return (
        <React.Fragment key={`figure-${i}`}>
          <div className={'col-12 col-lg-3 mb-lg-0 ' + (i === keyFigures.length - 1 ? 'mb-0' : 'mb-3')}>
            <a href={keyFigure.url} className='keyfigure-wrapper'>
              <div className={'keyfigure ' + (i === 0 ? 'first' : 'others')}>
                <div className={'ssb-link header stand-alone ' + (i !== 0 ? 'hide-mobile' : '')}>
                  <span className='link-text'>{keyFigure.urlText}</span>
                </div>
                <div className='number-section'>
                  {i === 0 || width > 768 ? addKeyfigure(keyFigure) : addKeyfigureMobile(keyFigure)}
                </div>
              </div>
            </a>
          </div>
        </React.Fragment>
      )
    })
  }

  function addKeyfigure(keyFigure) {
    if (keyFigure.number) {
      return (
        <React.Fragment>
          <div className='ssb-number small'>{keyFigure.number}</div>
          <span className='kf-title subtitle'>{keyFigure.numberDescription}</span>
        </React.Fragment>
      )
    } else {
      return <span className='no-number'>{keyFigure.noNumberText}</span>
    }
  }

  function addKeyfigureMobile(keyFigure) {
    if (keyFigure.number) {
      return (
        <React.Fragment>
          <div className='frontpage-keyfigure-mobile'>
            <div className='ssb-number small'>{keyFigure.number + ' ' + keyFigure.numberDescription}</div>
            <span className='kf-title subtitle'>{keyFigure.urlText}</span>
            <div className='icon-wrapper'>
              <ArrowRight size='24' />
            </div>
          </div>
        </React.Fragment>
      )
    } else {
      return <span className='no-number'>{keyFigure.noNumberText}</span>
    }
  }

  // functions to get and set browserwindow size
  function getWindowDimensions() {
    const { innerWidth: width, innerHeight: height } = window
    return {
      width,
      height,
    }
  }
  function useWindowDimensions() {
    const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions())

    useEffect(() => {
      function handleResize() {
        setWindowDimensions(getWindowDimensions())
      }

      window.addEventListener('resize', handleResize)
      return () => window.removeEventListener('resize', handleResize)
    }, [])

    return windowDimensions
  }

  return (
    <div className='container'>
      <div className='row d-flex flex-wrap'>{createRows()}</div>
    </div>
  )
}

FrontpageKeyfigures.propTypes = {
  keyFigures: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      title: PropTypes.string,
      url: PropTypes.string,
      urlText: PropTypes.string,
      number: PropTypes.string,
      numberDescription: PropTypes.string,
      noNumberText: PropTypes.string,
    })
  ),
}

export default (props) => <FrontpageKeyfigures {...props} />
