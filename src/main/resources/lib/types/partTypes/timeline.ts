export interface TimelineProps {
  timelineElements: TimelineElement[]
}

export interface TimelineElement {
  year: string
  event?: TimelineEvent | TimelineEvent[]
}

export interface TimelineEvent {
  title: string
  ingress?: string
  category?: string
  article?: string
}
