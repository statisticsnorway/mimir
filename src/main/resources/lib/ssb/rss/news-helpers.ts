import { format, isAfter, parseISO } from '/lib/vendor/dateFns'
import { getServerOffsetInMs } from '/lib/ssb/utils/serverOffset'
import { VariantInListing } from '../dashboard/statreg/types'
import { nextReleasedPassed } from '../utils/variantUtils'

export function findLatestRelease(
  variants: Array<VariantInListing>,
  serverOffsetInMs: number = getServerOffsetInMs()
): {
  latestVariant: VariantInListing
  latestRelease: Date
} {
  let latestRelease = new Date('1970-01-01')
  let latestVariant: VariantInListing = variants[0]
  for (const variant of variants) {
    if (isAfter(new Date(variant.previousRelease), latestRelease)) {
      latestRelease = new Date(variant.previousRelease)
      latestVariant = variant
    }
    // to catch if nextRelease time is in the past, but data not updated
    if (nextReleasedPassed(variant, serverOffsetInMs) && isAfter(new Date(variant.nextRelease), latestRelease)) {
      latestRelease = new Date(variant.nextRelease)
      latestVariant = variant
    }
  }
  return { latestVariant, latestRelease }
}

export function getPubDateStatistic(
  variant: VariantInListing,
  timeZoneIso: string,
  serverOffsetInMs: number = getServerOffsetInMs()
): string | undefined {
  const nextReleaseDatePassed: boolean = variant.nextRelease ? nextReleasedPassed(variant, serverOffsetInMs) : false
  const pubDate: string | undefined = nextReleaseDatePassed ? variant.nextRelease : variant.previousRelease
  return pubDate ? formatPubDateStatistic(pubDate, timeZoneIso) : undefined
}

export function formatPubDateArticle(date: string, serverOffsetInMS: number, timeZoneIso: string): string {
  const dateWithOffset = new Date(new Date(date).getTime() + serverOffsetInMS)
  const pubDate: string = format(dateWithOffset, "yyyy-MM-dd'T'HH:mm:ss")
  return `${pubDate}${timeZoneIso}`
}

export function formatPubDateStatistic(date: string, timeZoneIso: string): string {
  const pubDate: string = format(parseISO(date), "yyyy-MM-dd'T'HH:mm:ss")
  return `${pubDate}${timeZoneIso}`
}

export function getLinkByPath(path: string) {
  const baseUrl: string = app.config?.['ssb.baseUrl'] || 'https://www.ssb.no'
  const site = '/ssb'
  return baseUrl + path.substring(site.length)
}
