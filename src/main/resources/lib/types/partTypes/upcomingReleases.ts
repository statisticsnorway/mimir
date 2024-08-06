import { type PreparedUpcomingRelease } from '/lib/ssb/utils/filterReleasesUtils'
import { type YearReleases } from '/lib/types/variants'

export interface UpcomingReleasesProps {
  releases: Array<YearReleases>
  title?: string
  preface?: string
  language: string
  count: number
  upcomingReleasesServiceUrl: string
  buttonTitle: string
  contentReleasesNextXDays: Array<PreparedUpcomingRelease>
  contentReleasesAfterXDays: Array<PreparedUpcomingRelease>
}
