interface AdvertismentList {
  positionTitle?: string | NestedItemTag
  positionAdvertismentUrl?: string | NestedItemTag
  professionalField?: string | NestedItemTag
  location?: string | NestedItemTag
  employmentType?: string | NestedItemTag
  applicationDeadline?: string | NestedItemTag
}

interface WebcruiterAdvertismentListItem {
  [key: string]: string | NestedItemTag | undefined
}

export interface WebcruiterAdvertismentListRssFeed {
  rss: {
    channel: {
      item: WebcruiterAdvertismentListItem[]
    }
  }
}

export interface NestedItemTag {
  [key: string]: string | NestedItemTag | undefined
}
export interface WebcruiterAdvertismentListProps {
  title?: string
  showingPhrase?: string
  advertismentList: AdvertismentList[]
  professionalFieldPhrase?: string
  locationPhrase?: string
  employmentTypePhrase?: string
  applicationDeadlinePhrase?: string
}
