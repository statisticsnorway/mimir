import React from 'react'
import { Link } from '@statisticsnorway/ssb-component-library'
import { type TimelineProps2 } from '/lib/types/partTypes/timeline'

function Timeline2(props: TimelineProps2) {
  console.log('Heia Carina')
  const { timelineElements } = props
  console.log('TimelineElement: ' + JSON.stringify(timelineElements, null, 4))
  return (
    <div className='main-timeline fullwidth'>
      {timelineElements?.map((timeline, index) => {
        const event = Array.isArray(timeline.event) ? timeline.event : [timeline.event]
        return (
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
              <div className='content'>
                {event.map((event) => {
                  console.log('Event: ' + JSON.stringify(event, null, 4))
                  return (
                    <div className='event-content mb-3'>
                      <div className='icon'></div>
                      <Link linkType='profiled'>{event.title}</Link>
                      {event.category === 'statistic' && <p>statistikk</p>}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default (props: TimelineProps2) => <Timeline2 {...props} />
