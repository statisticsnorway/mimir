import { type PreparedContentRelease, type Release } from '/lib/types/variants'
import { isAfter, addDays, isBefore, isSameDay } from '/lib/vendor/dateFns'

export function filterReleasesIntoArrays(
  contentReleases: Array<PreparedContentRelease>,
  count: number,
  serverOffsetInMs: number,
  nowServerTime: Date
) {
  let start = new Date(nowServerTime.getTime() + serverOffsetInMs)
  const upperLimit = addDays(start, count)
  // Content releases has date at midnight, not correct publish time at 8 AM
  const publishTime = new Date(nowServerTime.setHours(8) + serverOffsetInMs)

  if (isAfter(start, publishTime)) {
    // We show todays releases only until published at 8 AM
    start = addDays(start, 1)
  }
  const contentReleasesNextXDays: PreparedContentRelease[] = []
  const contentReleasesAfterXDays: PreparedContentRelease[] = []

  for (const release of contentReleases) {
    if (isSameDayOrAfter(new Date(release.date), start) && isBefore(new Date(release.date), upperLimit)) {
      contentReleasesNextXDays.push(release)
    } else if (isSameDayOrAfter(new Date(release.date), upperLimit)) {
      contentReleasesAfterXDays.push(release)
    }
  }

  return { contentReleasesNextXDays, contentReleasesAfterXDays }
}

export function filterOnComingReleases(
  releases: Array<Release>,
  serverOffsetInMs: number,
  count?: number,
  startDay?: string
): Array<Release> {
  let start: Date
  if (!startDay) {
    // To make sure todays publications shows until actually published
    start = new Date(new Date().getTime() + serverOffsetInMs)
  } else {
    start = new Date(startDay)
  }

  if (!!count) {
    const upperLimit = addDays(start, count)
    return releases.filter(
      (release: Release) =>
        isAfter(new Date(release.publishTime), start) && isBefore(new Date(release.publishTime), upperLimit)
    )
  } else {
    return releases.filter((release: Release) => isAfter(new Date(release.publishTime), start))
  }
}

function isSameDayOrAfter(d1: Date, d2: Date): boolean {
  return isSameDay(d1, d2) || isAfter(d1, d2)
}
