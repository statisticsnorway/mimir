import { format, isAfter, parseISO } from '/lib/vendor/dateFns'
import { getServerOffsetInMs } from '/lib/ssb/utils/serverOffset'
import { VariantInListing } from '../dashboard/statreg/types'
import { nextReleasedPassed } from '../utils/variantUtils'

export const rssDateFormat = "yyyy-MM-dd'T'HH:mm:ssxx"

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
  serverOffsetInMs: number = getServerOffsetInMs()
): string | undefined {
  const nextReleaseDatePassed: boolean = variant.nextRelease ? nextReleasedPassed(variant, serverOffsetInMs) : false
  const pubDate: string | undefined = nextReleaseDatePassed ? variant.nextRelease : variant.previousRelease
  return pubDate ? formatPubDateStatistic(pubDate) : undefined
}

export function formatPubDateArticle(date: string): string {
  const dateWithOffset = new Date(date)
  return format(dateWithOffset, rssDateFormat)
}

export function formatPubDateStatistic(date: string): string {
  return format(parseISO(date), rssDateFormat)
}

export function getLinkByPath(path: string) {
  const baseUrl: string = app.config?.['ssb.baseUrl'] || 'https://www.ssb.no'
  const site = '/ssb'
  return baseUrl + path.substring(site.length)
}
