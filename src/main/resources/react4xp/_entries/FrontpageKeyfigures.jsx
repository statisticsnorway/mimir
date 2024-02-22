import React from 'react'
import PropTypes from 'prop-types'
import { ArrowRight } from 'react-feather'

function FrontpageKeyfigures({ keyFigures }) {
  return (
    <div className='container'>
      <div className='row d-flex flex-wrap'>
        {keyFigures.map((keyFigure, i) => {
          return (
            <div
              key={`figure-${i}`}
              className={'keyfigure-row col-12 col-lg-3 mb-lg-0 ' + (i === keyFigures.length - 1 ? 'mb-0' : 'mb-3')}
            >
              <a href={keyFigure.url} className='keyfigure-wrapper'>
                <div className='keyfigure'>
                  <div className='ssb-link header stand-alone'>
                    <span className='link-text'>{keyFigure.urlText}</span>
                  </div>
                  <div className='number-section'>
                    {keyFigure.number && (
                      <div className='frontpage-keyfigure'>
                        <div className='ssb-number small'>
                          <span className='number'>{keyFigure.number}</span>
                          <span className='description'> {keyFigure.numberDescription}</span>
                        </div>
                        <span className='kf-title subtitle'>
                          <span className='url'>{keyFigure.urlText}</span>
                          <span className='description'>{keyFigure.numberDescription}</span>
                        </span>
                        <div className='icon-wrapper'>
                          <ArrowRight size='24' />
                        </div>
                      </div>
                    )}
                    {!keyFigure.number && <span className='no-number'>{keyFigure.noNumberText}</span>}
                  </div>
                </div>
              </a>
            </div>
          )
        })}
      </div>
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
