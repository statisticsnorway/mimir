interface AdvertismentList {
  positionTitle?: string | NestedItemValue
  positionAdvertismentUrl?: string | NestedItemValue
  professionalField?: string | NestedItemValue
  location?: string | NestedItemValue
  employmentType?: string | NestedItemValue
  applicationDeadline?: string | NestedItemValue
}

interface WebcruiterAdvertismentListItem {
  [key: string]: string | NestedItemValue | undefined
}

export interface WebcruiterAdvertismentListRssFeed {
  rss: {
    channel: {
      item: WebcruiterAdvertismentListItem[]
    }
  }
}

export interface NestedItemValue {
  [key: string]: string | NestedItemValue | undefined
}
export interface WebcruiterAdvertismentListProps {
  title?: string
  showingPhrase?: string
  advertismentList: AdvertismentList[]
  professionalFieldPhrase?: string
  locationPhrase?: string
  employmentTypePhrase?: string
  applicationDeadlinePhrase?: string
  noResultsPhrase?: string
}
