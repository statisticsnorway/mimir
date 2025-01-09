import React from 'react'
import { CategoryLink, Link } from '@statisticsnorway/ssb-component-library'
import { type TimelineProps, type TimelineEvent } from '/lib/types/partTypes/timeline'

function addCategoryLink(event: TimelineEvent) {
  return (
    <div className='event-content'>
      <CategoryLink href='' titleText={event.title} subText={event.ingress} />
    </div>
  )
}

function addEventBox(event: TimelineEvent) {
  return (
    <div className='timeline-event'>
      {event.article ? <Link linkType='header'>{event.title}</Link> : <span className='title'>{event.title}</span>}
      {event.ingress && <span>{event.ingress}</span>}
    </div>
  )
}

function Timeline(props: TimelineProps) {
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
                return <div>{event.article ? addCategoryLink(event) : addEventBox(event)}</div>
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default (props: TimelineProps) => <Timeline {...props} />
