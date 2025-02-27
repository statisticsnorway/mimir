import React, { useEffect, useState, useRef } from 'react'
import { Button, CategoryLink, Card, ExpansionBox, Link, Tag, Text } from '@statisticsnorway/ssb-component-library'
import { ChevronDown } from 'react-feather'
import { type TimelineProps, type TimelineElement, type TimelineEvent } from '/lib/types/partTypes/timeline'
import { sanitize } from '/lib/ssb/utils/htmlUtils'
import { usePaginationKeyboardNavigation } from '/lib/ssb/utils/customHooks/paginationHooks'

function Timeline(props: TimelineProps) {
  const { timelineElements, countYear, showMoreButtonText } = props
  const [selectedTag, setSelectedTag] = useState('all')
  const [filteredElements, setFilteredElements] = useState(timelineElements)
  const [active, setActive] = useState(false)
  const [timelineCount, setTimeLineCount] = useState(countYear)
  const [keyboardNavigation, setKeyboardNavigation] = useState(false)

  const firstNewTimelineRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (selectedTag !== 'all') {
      setFilteredElements(filterElementsByCategory(timelineElements, selectedTag))
    } else {
      setFilteredElements(props.timelineElements)
    }
  }, [selectedTag])

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
    setTimeLineCount((prevCount) => prevCount + countYear)
  }

  function setFilter(filter: string) {
    setSelectedTag(filter)
    setActive(true)
    setTimeout(() => {
      setActive(false)
    }, 1000)
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
        subText={event.ingress}
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
        <Text>{event.ingress}</Text>
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
        {event.ingress && <span>{event.ingress}</span>}
      </div>
    )
  }

  function addEventExpansionBox(event: TimelineEvent) {
    const text = event.eventText ? (
      <div
        dangerouslySetInnerHTML={{
          __html: sanitize(event.eventText),
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
    if (event.directorImage) {
      return addDirectorCard(event)
    }
    if (event.urlArticle) {
      return addCategoryLink(event)
    }

    if (event.eventText) {
      return addEventExpansionBox(event)
    }

    if (!event.eventText && !event.article) {
      return addEventBox(event)
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
        <div className='triangle' />
        {events?.length && addEvents(events)}
      </div>
    )
  }

  function addFilter() {
    return (
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
    )
  }

  function addTimeLine() {
    return (
      <div className={`timeline ${active ? 'active' : ''}`}>
        <div className='circle' />
        <div className='timeline-elements'>
          {filteredElements?.slice(0, timelineCount).map((timeline, i) => {
            return <>{addTimelineYear(timeline, i)}</>
          })}
        </div>
        {timelineElements.length > countYear && renderShowMoreButton()}
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
