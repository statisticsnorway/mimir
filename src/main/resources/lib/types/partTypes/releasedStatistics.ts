import { type YearReleases } from '/lib/types/variants'

export interface ReleasedStatisticsProps {
  releases: Array<YearReleases>
  title: string
  language: string
}

export interface GroupedBy<T> {
  [key: string]: Array<T> | T
}
