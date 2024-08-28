interface WebcruiterAdvertismentListItem {
  [key: string]: string | NestedItemValue | undefined
}

interface WebcruiterAdvertismentListRssFeed {
  rss: {
    channel: {
      item: WebcruiterAdvertismentListItem[]
    }
  }
}

export interface WebcruiterAdvertismentListRssFeedResponseErrorMessage {
  errorMessage?: string
}

export interface WebcruiterAdvertismentListRssFeedResponse {
  status: number
  message?: string
  body: WebcruiterAdvertismentListRssFeed
  application: string
}

export interface NestedItemValue {
  [key: string]: string | NestedItemValue | undefined
}

export interface AdvertismentList {
  positionTitle?: string | NestedItemValue
  positionAdvertismentUrl?: string | NestedItemValue
  professionalField?: string | NestedItemValue
  location?: string | NestedItemValue
  employmentType?: string | NestedItemValue
  applicationDeadline?: string | NestedItemValue
}

export interface WebcruiterAdvertismentListProps {
  title?: string
  showingPhrase?: string
  advertismentList: AdvertismentList[] | WebcruiterAdvertismentListRssFeedResponseErrorMessage
  professionalFieldPhrase?: string
  locationPhrase?: string
  employmentTypePhrase?: string
  applicationDeadlinePhrase?: string
  noResultsPhrase?: string
}
