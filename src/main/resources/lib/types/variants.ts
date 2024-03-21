export interface PreparedVariant {
  id: string
  day: number
  monthNumber: number
  year: number
  frequency: string
  period: string
}

export interface Release {
  publishTime: string
  periodFrom: string
  periodTo: string
  frequency: string
  variantId: string
  statisticId: number
  shortName: string
  statisticName: string
  statisticNameEn: string
  status: string
}

export interface DayReleases {
  day: string
  releases: Array<PreparedStatistics>
}

export interface MonthReleases {
  month: string
  monthName: string
  releases: Array<DayReleases>
}

export interface YearReleases {
  year: string
  releases: Array<MonthReleases>
}

export interface GroupedBy<T> {
  [key: string]: Array<T> | T
}

export interface PreparedStatistics {
  id: number
  name: string
  shortName: string
  variant: PreparedVariant
  type?: string
  date?: string
  mainSubject?: string
  statisticsPageUrl?: string
  aboutTheStatisticsDescription?: string
}

export interface PreparedUpcomingRelease {
  id: string
  name: string
  type: string
  date: string
  mainSubject: string
  day: string
  month: string
  monthName: string
  year: string
  upcomingReleaseLink?: string
}
