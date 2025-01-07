import React from 'react'
import { type TimelineProps2 } from '/lib/types/partTypes/timeline'

function Timeline2(props: TimelineProps2) {
  console.log('Heia Carina')
  const { timelineElements } = props
  console.log('TimelineElement: ' + JSON.stringify(timelineElements, null, 4))
  return (
    <div className='main-timeline fullwidth'>
      {timelineElements?.map((timeline, index) => {
        return (
          /*  <div className={`timeline ${index % 2 === 0 ? 'left' : 'right'}`} key={index}> */
          <div className={`timeline `} key={index}>
            <div className='timeline-content'>
              <div className='triangle'></div>
              <div className='rectangle'>
                <span>
                  <div className='year'>{timeline.year}</div>
                </span>
              </div>
              <div className='line'></div>
              <div className='icon'></div>
              {timeline.event.map((event) => {
                return (
                  <div className='content'>
                    <div className='text-content'>
                      <h2 className='description'>{event.title}</h2>
                    </div>
                    {/* {event.article && (
                      <a
                        className='read-more'
                        href='/en-gb/visualisations/timeline-125-years-of-population-censuses/1899'
                      >
                        Les mer om dette året
                      </a>
                    )} */}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default (props: TimelineProps2) => <Timeline2 {...props} />
