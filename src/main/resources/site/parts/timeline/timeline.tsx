import React, { useEffect, useState } from 'react'
import { CategoryLink, Link, Tag } from '@statisticsnorway/ssb-component-library'
import { type TimelineProps, type TimelineElement, type TimelineEvent } from '/lib/types/partTypes/timeline'

function Timeline(props: TimelineProps) {
  const { timelineElements } = props
  // const [filteredElements, setFilteredElements] = useState([])
  //const [selectedTag, setSelectedTag] = useState('Alle')
  const [selectedTag, setSelectedTag] = useState('Alle')

  useEffect(() => {
    console.log(selectedTag)
    //setFilteredElements(props.timelineElements)
  }, [])

  function setFilter(filter: string) {
    setSelectedTag(filter)
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
        <Tag className='statistikk' onClick={() => setFilter('statistikk')}>
          Statistiske hendelser
        </Tag>
        <Tag className='ssb' onClick={() => setFilter('ssb')}>
          Institusjonelle hendelser
        </Tag>
        <Tag className='direktor' onClick={() => setFilter('direktor')}>
          Direktører
        </Tag>
        <Tag className='nokkeltall' onClick={() => setFilter('nokkeltall')}>
          Nøkkeltall
        </Tag>
      </div>
    )
  }

  return (
    <div className='ssb-timeline'>
      {addFilter()}
      <div className='timeline'>
        <div className='circle' />
        <div className='timeline-elements'>
          {timelineElements?.map((timeline) => {
            return <>{addTimelineYear(timeline)}</>
          })}
        </div>
      </div>
    </div>
  )
}

export default (props: TimelineProps) => <Timeline {...props} />
