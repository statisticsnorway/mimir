import React from 'react'
import { type TimelineProps } from '/lib/types/partTypes/timeline'

function Timeline(props: TimelineProps) {
  const { timelineElements } = props
  return (
    <div className='main-timeline'>
      {timelineElements?.map((link, index) => {
        return (
          <div className={`timeline ${index % 2 === 0 ? 'left' : 'right'}`} key={index}>
            {/* <div className={`timeline `} key={index}>  */}
            <div className='timeline-content'>
              <div className='triangle'></div>
              <div className='rectangle'>
                <span>
                  <div className='year'>{link.year}</div>
                </span>
              </div>
              <div className='line'></div>
              <div className='icon'></div>
              <div className='content'>
                <div className='text-content'>
                  <h2 className='description'>{link.title}</h2>
                </div>
                {link.article && (
                  <a className='read-more' href='/en-gb/visualisations/timeline-125-years-of-population-censuses/1899'>
                    Les mer om dette året
                  </a>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default (props: TimelineProps) => <Timeline {...props} />
