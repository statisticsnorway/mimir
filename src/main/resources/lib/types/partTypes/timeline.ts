export interface TimelineProps {
  timelineElements: TimelineElement[]
  showMoreButtonText: string
  countYear: number
}

export interface TimelineElement {
  year: string
  event?: TimelineEvent | TimelineEvent[]
}

export interface TimelineEvent {
  title: string
  ingress?: string
  eventText?: string
  directorImage?: string
  directorImageAltText?: string
  category?: string
  article?: string
  urlArticle?: hrefManual | hrefContent
  targetUrl?: string
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
