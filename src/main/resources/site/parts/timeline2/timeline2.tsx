import React from 'react'
import { CategoryLink } from '@statisticsnorway/ssb-component-library'
import { type TimelineProps2, type TimelineEvent } from '/lib/types/partTypes/timeline'

function addEventBox(event: TimelineEvent) {
  return (
    <div className='event-content'>
      <CategoryLink href='' titleText={event.title} subText={event.ingress} />
    </div>
  )
}

/* function addEventBoxOld(event: TimelineEvent) {
  return (
    <div className='timeline-event'>
      {event.article ? <Link linkType='header'>{event.title}</Link> : <span className='title'>{event.title}</span>}
      {event.ingress && <span>{event.ingress}</span>}
    </div>
  )
} */

function Timeline2(props: TimelineProps2) {
  const { timelineElements } = props
  return (
    <div className='ssb-timeline'>
      {timelineElements?.map((timeline) => {
        const event = Array.isArray(timeline.event) ? timeline.event : [timeline.event]
        return (
          <div className='timeline-content' key={timeline.year}>
            <div className='year'>
              <span>{timeline.year}</span>
            </div>
            <div className='line'></div>
            <div className='icon'></div>
            <div className='content'>
              {event.map((event) => {
                return addEventBox(event)
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default (props: TimelineProps2) => <Timeline2 {...props} />
