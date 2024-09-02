interface WebcruiterAdvertisementListItem {
  [key: string]: string | NestedItemValue | undefined
}

interface WebcruiterAdvertisementListRssFeed {
  rss: {
    channel: {
      item: WebcruiterAdvertisementListItem[]
    }
  }
}

export interface WebcruiterAdvertisementListRssFeedResponseErrorMessage {
  errorMessage?: string
}

export interface WebcruiterAdvertisementListRssFeedResponse {
  status: number
  message?: string
  body: WebcruiterAdvertisementListRssFeed
  application: string
}

export interface NestedItemValue {
  [key: string]: string | NestedItemValue | undefined
}

export interface AdvertisementList {
  positionTitle?: string | NestedItemValue
  positionAdvertisementUrl?: string | NestedItemValue
  professionalField?: string | NestedItemValue
  location?: string | NestedItemValue
  employmentType?: string | NestedItemValue
  applicationDeadline?: string | NestedItemValue
}

export interface WebcruiterAdvertisementListProps {
  title?: string
  showingPhrase?: string
  advertisementList: AdvertisementList[] | WebcruiterAdvertisementListRssFeedResponseErrorMessage
  professionalFieldPhrase?: string
  locationPhrase?: string
  employmentTypePhrase?: string
  applicationDeadlinePhrase?: string
  noResultsPhrase?: string
}
