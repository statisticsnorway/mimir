import { type PreparedContentRelease, type YearReleases, type PreparedUpcomingRelease } from '/lib/types/variants'

export interface UpcomingReleasesProps {
  releases: Array<YearReleases>
  title?: string
  preface?: string
  language: string
  count: number
  upcomingReleasesServiceUrl: string
  buttonTitle: string
  contentReleasesNextXDays: Array<PreparedContentRelease>
  contentReleasesAfterXDays: Array<PreparedContentRelease>
}

export interface FlattenedUpcomingReleases {
  date: string
  releases: Array<PreparedUpcomingRelease>
}

export interface FlattenedUpcomingReleasesDate {
  day: number
  monthName: string
  year: number
}
