import React, { useEffect, useState } from 'react'
import { CategoryLink, Link, Tag } from '@statisticsnorway/ssb-component-library'
import { type TimelineProps, type TimelineElement, type TimelineEvent } from '/lib/types/partTypes/timeline'

function Timeline(props: TimelineProps) {
  const { timelineElements } = props
  const [selectedTag, setSelectedTag] = useState('all')
  const [filteredElements, setFilteredElements] = useState(props.timelineElements)

  useEffect(() => {
    console.log(selectedTag)
    if (selectedTag !== 'all') {
      setFilteredElements(filterElementsByCategory(timelineElements, selectedTag))
    } else {
      setFilteredElements(props.timelineElements)
    }
  }, [selectedTag])

  function setFilter(filter: string) {
    setSelectedTag(filter)
  }

  const filterElementsByCategory = (elements: TimelineElement[], category: string) => {
    if (category === 'all') {
      return elements
    }
    return elements
      .map((element) => {
        if (element.event) {
          const filteredEvents = Array.isArray(element.event)
            ? element.event.filter((event) => event.category === category)
            : element.event.category === category
              ? element.event
              : null

          return filteredEvents ? { ...element, event: filteredEvents } : null
        }
        return null
      })
      .filter((element) => element !== null)
  }

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
        {events.map((event, index) => {
          return (
            <div key={index} onClick={() => console.log('halla alla')}>
              {event.article ? addCategoryLink(event) : addEventBox(event)}
            </div>
          )
        })}
      </div>
    )
  }
  function addTimelineYear(timeline: TimelineElement) {
    const events = timeline.event ? (Array.isArray(timeline.event) ? timeline.event : [timeline.event]) : []
    if (events.length === 0) {
      return null
    }
    return (
      <div className='timeline-content' key={timeline.year}>
        <div className='year'>
          <span>{timeline.year}</span>
        </div>
        <div className='triangle' />
        {events?.length && addEvents(events)}
      </div>
    )
  }

  function addFilter() {
    return (
      <div className='filter'>
        <Tag className='all' onClick={() => setFilter('all')}>
          Vis alt
        </Tag>
        <Tag className='statistikk' onClick={() => setFilter('statistic')}>
          Statistiske hendelser
        </Tag>
        <Tag className='eventSsb' onClick={() => setFilter('eventSsb')}>
          Institusjonelle hendelser
        </Tag>
        <Tag className='direktor' onClick={() => setFilter('director')}>
          Direktører
        </Tag>
        <Tag className='nokkeltall' onClick={() => setFilter('nokkeltall')}>
          Nøkkeltall
        </Tag>
      </div>
    )
  }

  function addTimeLine() {
    return (
      <div className='timeline'>
        <div className='circle' />
        <div className='timeline-elements'>
          {filteredElements?.map((timeline) => {
            return <>{addTimelineYear(timeline)}</>
          })}
        </div>
      </div>
    )
  }

  return (
    <div className='ssb-timeline'>
      {addFilter()}
      {addTimeLine()}
    </div>
  )
}

export default (props: TimelineProps) => <Timeline {...props} />
