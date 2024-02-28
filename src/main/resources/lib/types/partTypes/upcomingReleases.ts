import { PreparedUpcomingRelease } from '/lib/ssb/utils/filterReleasesUtils'
import { YearReleases } from '../variants'

export interface UpcomingReleasesProps {
  releases: Array<YearReleases>
  title?: string
  preface?: string
  language: string
  count: number
  upcomingReleasesServiceUrl: string
  buttonTitle: string
  statisticsPageUrlText: string
  contentReleasesNextXDays: Array<PreparedUpcomingRelease>
  contentReleasesAfterXDays: Array<PreparedUpcomingRelease>
}
