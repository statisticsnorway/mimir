export interface TimelineProps {
  title: string
  ingress: string
  timelineElements: TimelineElement[]
  showMoreButtonText: string
  countYear: number
}

export interface TimelineElement {
  year: string
  event: TimelineEvent[]
  //event?: TimelineEvent | TimelineEvent[]
}

export interface TimelineEvent {
  eventType: string
  title: string
  text?: string
  directorImage?: string
  directorImageAltText?: string
  timelineCategory?: string
  targetUrl?: string
}
export interface SimpleBox {
  title: string
  text?: string
  timelineCategory: string
  urlContentSelector?: hrefManual | hrefContent
}

export interface ExpansionBox {
  title: string
  text?: string
  timelineCategory: string
}

export interface DirectorBox {
  title: string
  text?: string
  directorImage?: string
  urlContentSelector?: hrefManual | hrefContent
}

export interface Event {
  simpleBox?: SimpleBox
  expansionBox?: ExpansionBox
  directorBox?: DirectorBox
  _selected: 'simpleBox' | 'expansionBox' | 'directorBox'
}

export interface TimelineItemSet {
  year: string
  event: Event[]
}

interface hrefManual {
  _selected: 'optionLink'
  optionLink: {
    link?: string
  }
}

interface hrefContent {
  _selected: 'optionXPContent'
  optionXPContent: {
    xpContent?: string
  }
}
