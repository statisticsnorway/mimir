import React, { useEffect, useState, useRef, useMemo } from 'react'
import {
  Button,
  CategoryLink,
  Card,
  ExpansionBox,
  Link,
  Tag,
  Text,
  Title,
} from '@statisticsnorway/ssb-component-library'
import { ChevronDown } from 'react-feather'
import { type TimelineProps, type TimelineElement, type TimelineEvent } from '/lib/types/partTypes/timeline'
import { sanitize } from '/lib/ssb/utils/htmlUtils'
import { usePaginationKeyboardNavigation } from '/lib/ssb/utils/customHooks/paginationHooks'

function Timeline(props: TimelineProps) {
  const { timelineElements, countYear, showMoreButtonText, title, ingress, showFilter } = props
  const [selectedTag, setSelectedTag] = useState('all')
  const [timelineCount, setTimeLineCount] = useState(countYear)
  const [keyboardNavigation, setKeyboardNavigation] = useState(false)

  const firstNewTimelineRef = useRef<HTMLDivElement>(null)

  const filterElementsByCategory = (elements: TimelineElement[], category: string) => {
    if (category === 'all') {
      return elements
    }
    const filteredElements: TimelineElement[] = []
    elements.forEach((element) => {
      if (element.event) {
        const filteredEvents = element.event.filter((event) => event.timelineCategory === category)
        if (filteredEvents.length > 0) {
          filteredElements.push({ ...element, event: filteredEvents })
        }
      }
    })
    return filteredElements
  }

  const filteredElements = useMemo(() => {
    if (selectedTag !== 'all') {
      return filterElementsByCategory(timelineElements, selectedTag)
    }
    return timelineElements
  }, [selectedTag, timelineElements])

  useEffect(() => {
    if (keyboardNavigation && firstNewTimelineRef.current) {
      const firstEvent = firstNewTimelineRef.current.querySelector('.event')
      if (firstEvent) {
        const firstFocusable = firstEvent.querySelector('a, button, input, [tabindex]:not([tabindex="-1"])')
        if (firstFocusable) {
          ;(firstFocusable as HTMLElement).focus()
        }
      }
    }
  }, [timelineCount])

  const fetchMoreYear = () => {
    setTimeLineCount((prevCount) => Number(prevCount) + Number(countYear))
  }

  function setFilter(filter: string) {
    setSelectedTag(filter)
  }

  const handleOnClick = () => {
    setKeyboardNavigation(false)
    fetchMoreYear()
  }

  const handleKeyboardNavigation = usePaginationKeyboardNavigation(() => {
    setKeyboardNavigation(true)
    fetchMoreYear()
  })

  function isExternalUrl(url?: string): boolean {
    return !!url && !url.startsWith('/') && !url.includes('ssb.no')
  }

  function renderShowMoreButton() {
    return (
      <Button
        primary
        className='button-more'
        disabled={timelineCount === timelineElements.length}
        onClick={handleOnClick}
        onKeyDown={handleKeyboardNavigation}
      >
        <ChevronDown size='18' />
        {showMoreButtonText}
      </Button>
    )
  }

  function addCategoryLink(event: TimelineEvent) {
    return (
      <CategoryLink
        external={isExternalUrl(event.targetUrl)}
        href={event.targetUrl}
        titleText={event.title}
        subText={event.text}
      />
    )
  }

  function addDirectorCard(event: TimelineEvent) {
    return (
      <Card
        title={event.title}
        href={event.targetUrl}
        icon={<img src={event.directorImage} alt={event.directorImageAltText} loading='lazy' />}
        profiled
      >
        <Text>{event.text}</Text>
      </Card>
    )
  }

  function addEventBox(event: TimelineEvent) {
    return (
      <div className='event-box'>
        {event.targetUrl ? (
          <Link linkType='header' href={event.targetUrl}>
            {event.title}
          </Link>
        ) : (
          <span className='title'>{event.title}</span>
        )}
        {event.text && <span className='text'>{event.text}</span>}
      </div>
    )
  }

  function addEventExpansionBox(event: TimelineEvent) {
    const text = event.text ? (
      <div
        dangerouslySetInnerHTML={{
          __html: sanitize(event.text),
        }}
      ></div>
    ) : (
      ''
    )

    return <ExpansionBox header={event.title} text={text} sneakPeek />
  }

  function addEvents(events: TimelineEvent[]) {
    return (
      <div className='events'>
        {events.map((event, index) => {
          return (
            <div className='event' key={index}>
              {addEvent(event)}
            </div>
          )
        })}
      </div>
    )
  }

  function addEvent(event: TimelineEvent) {
    if (event.eventType === 'directorBox') {
      return addDirectorCard(event)
    }
    if (event.eventType === 'simpleBox' && event.targetUrl) {
      return addCategoryLink(event)
    }

    if (event.eventType === 'simpleBox' && !event.targetUrl) {
      return addEventBox(event)
    }

    if (event.eventType === 'expansionBox') {
      return addEventExpansionBox(event)
    }
    return addEventBox(event)
  }

  function addTimelineYear(timeline: TimelineElement, i: number) {
    const events = timeline.event ? (Array.isArray(timeline.event) ? timeline.event : [timeline.event]) : []
    if (events.length === 0) {
      return null
    }
    return (
      <div
        className='timeline-content'
        key={timeline.year}
        ref={i === timelineCount - countYear ? firstNewTimelineRef : null}
      >
        <div className='year'>
          <span>{timeline.year}</span>
        </div>
        {events?.length && addEvents(events)}
      </div>
    )
  }

  function addFilter() {
    return (
      <div className='filter-container'>
        <div className='filter'>
          <Tag className={!selectedTag || selectedTag === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>
            Vis alt
          </Tag>
          <Tag className={selectedTag === 'statistic' ? 'active' : ''} onClick={() => setFilter('statistic')}>
            Statistikk
          </Tag>
          <Tag className={selectedTag === 'aboutSsb' ? 'active' : ''} onClick={() => setFilter('aboutSsb')}>
            Om SSB
          </Tag>
          <Tag className={selectedTag === 'director' ? 'active' : ''} onClick={() => setFilter('director')}>
            Direktører
          </Tag>
        </div>
      </div>
    )
  }

  function addTitle() {
    return (
      <div className='title-container'>
        <div className='title-ingress-wrapper'>
          <Title className='title' size={1}>
            {title}
          </Title>
          <p className='ingress'>{ingress}</p>
        </div>
      </div>
    )
  }

  function addTimeLine() {
    return (
      <div className='timeline-container'>
        <div className='timeline'>
          <div className='circle' />
          <div className='timeline-elements'>
            {filteredElements?.slice(0, timelineCount).map((timeline, i) => {
              return <>{addTimelineYear(timeline, i)}</>
            })}
          </div>
          {filteredElements.length > countYear && filteredElements.length > timelineCount && renderShowMoreButton()}
        </div>
      </div>
    )
  }

  return (
    <div className='ssb-timeline'>
      {title && addTitle()}
      {showFilter && addFilter()}
      {addTimeLine()}
    </div>
  )
}

export default (props: TimelineProps) => <Timeline {...props} />
