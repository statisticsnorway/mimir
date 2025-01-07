export interface TimelineProps {
  timelineElements: TimelineElement[]
}

export interface TimelineProps2 {
  timelineElements: TimelineElement2[]
}
export interface TimelineElement {
  year: string
  title: string
  article?: string
}

export interface TimelineElement2 {
  year: string
  event: TimelineEvent | TimelineEvent[]
}

export interface TimelineEvent {
  title: string
  category?: string
  article?: string
}
