import React from 'react'
import { CategoryLink, Link } from '@statisticsnorway/ssb-component-library'
import { type TimelineProps, type TimelineElement, type TimelineEvent } from '/lib/types/partTypes/timeline'

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

function addEvents(events: TimelineEvent[]) {
  return (
    <div className='content'>
      {events.map((event) => {
        return <div>{event.article ? addCategoryLink(event) : addEventBox(event)}</div>
      })}
    </div>
  )
}

function addTimelineYear(timeline: TimelineElement, index: number) {
  const events = timeline.event ? (Array.isArray(timeline.event) ? timeline.event : [timeline.event]) : []
  if (index === 0) {
    return (
      <div className='timeline-content first' key={timeline.year}>
        <div className='year first'>
          <span>{timeline.year}</span>
        </div>
        {events?.length && addEvents(events)}
      </div>
    )
  } else {
    return (
      <div className='timeline-content' key={timeline.year}>
        <div className='year'>
          <span>{timeline.year}</span>
        </div>
        <div className='line'></div>
        <div className='icon'></div>
        {events?.length && addEvents(events)}
      </div>
    )
  }
}

function Timeline(props: TimelineProps) {
  const { timelineElements } = props
  return (
    <div className='ssb-timeline'>
      {timelineElements?.map((timeline, index) => {
        return <>{addTimelineYear(timeline, index)}</>
      })}
    </div>
  )
}

export default (props: TimelineProps) => <Timeline {...props} />
