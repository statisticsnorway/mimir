import React from 'react'
import { type TimelineProps } from '/lib/types/partTypes/timeline'

function Timeline(props: TimelineProps) {
  const { timelineElements } = props
  return (
    <div className='main-timeline'>
      {timelineElements?.map((link, index) => {
        return (
          <div className={`timeline ${index % 2 === 0 ? 'left' : 'right'}`} key={index}>
            <div className='timeline-content'>
              {index % 2 !== 0 && <div className='triangle'></div>}
              <div className='rectangle'>
                <span>
                  <div className='year'>{link.year}</div>
                </span>
              </div>
              {index % 2 === 0 && <div className='triangle'></div>}
              <div className='line'></div>
              <div className='icon'></div>
              <div className='content'>
                <div className='text-content'>
                  <h2 className='description'>{link.title}</h2>
                </div>
                <a className='read-more' href='/en-gb/visualisations/timeline-125-years-of-population-censuses/1899'>
                  Read more on the year of establishment
                </a>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default (props: TimelineProps) => <Timeline {...props} />
