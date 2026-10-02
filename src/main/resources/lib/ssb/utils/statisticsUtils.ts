import '/lib/ssb/polyfills/nashorn'
import { type Content } from '/lib/xp/content'
import { StatisticInListing, VariantInListing, ReleaseDatesVariant } from '/lib/ssb/dashboard/statreg/types'
import { formatDate } from '/lib/ssb/utils/dateUtils'
import { isAfter } from '/lib/vendor/dateFns'
import { ensureArray } from '/lib/ssb/utils/arrayUtils'
import { type StatisticsDates } from '/lib/types/partTypes/statisticHeader'
import { type Phrases } from '/lib/types/language'
import { fetchReleasesFromStatregApi, getReleaseDatesByVariants } from '/lib/ssb/statreg/statistics'
import { type Statistics } from '/site/content-types'

export type StatregApiReleaseDates = {
  nextReleaseDate?: string
  previousReleaseDate?: string
  previewNextReleaseDate?: string
}

export function getStatisticTitle(statisticsContent: Content<Statistics>, statistic?: StatisticInListing): string {
  if (!statistic) {
    return statisticsContent.displayName
  }

  return statisticsContent.language === 'en' && statistic.nameEN ? statistic.nameEN : statistic.name
}

export function getStatisticsDates(
  statisticsContent: Content<Statistics>,
  phrases: Phrases,
  showDraft: boolean,
  statistic?: StatisticInListing
): StatisticsDates {
  const language = statisticsContent.language === 'en' ? 'en' : 'nb'
  const showModifiedTime: boolean = statisticsContent.data.showModifiedDate?.modifiedOption.showModifiedTime ?? false
  const modifiedDate: string | undefined = statisticsContent.data.showModifiedDate?.modifiedOption?.lastModified
  const variants: Array<VariantInListing | undefined> = statistic ? ensureArray(statistic.variants) : []
  const releaseDates: ReleaseDatesVariant = getReleaseDatesByVariants(variants as Array<VariantInListing>)
  const nextReleases = releaseDates.nextRelease ?? []
  const previousReleases = releaseDates.previousRelease ?? []
  const previousReleaseDate = previousReleases.length ? previousReleases[0] : undefined

  const changeDate: string | undefined = getChangeDate(previousReleaseDate, modifiedDate, language, showModifiedTime)

  const { previousRelease, nextRelease, previewNextRelease } = getNextReleaseDates(
    nextReleases,
    previousReleases,
    phrases.notAvailable,
    phrases.notYetDetermined,
    language
  )

  return {
    changeDate,
    previousRelease: showDraft ? nextRelease : previousRelease,
    nextRelease: showDraft ? previewNextRelease : nextRelease,
  }
}

function getNextReleaseDates(
  nextReleases: string[],
  previousReleases: string[],
  notAvailablePhrase: string,
  notYetDeterminedPhrase: string,
  language: string
): {
  previousRelease: string | undefined
  nextRelease: string | undefined
  previewNextRelease: string | undefined
} {
  const previousRelease = previousReleases.length
    ? formatDate(previousReleases[0], 'PPP', language)
    : notAvailablePhrase
  const nextRelease = nextReleases.length ? formatDate(nextReleases[0], 'PPP', language) : notYetDeterminedPhrase
  const previewNextRelease =
    nextReleases.length > 1 ? formatDate(nextReleases[1], 'PPP', language) : notYetDeterminedPhrase

  return {
    previousRelease,
    nextRelease,
    previewNextRelease,
  }
}

function getChangeDate(
  previousReleaseDate: string | undefined,
  modifiedDate: string | undefined,
  language: string,
  showModifiedTime: boolean
): string | undefined {
  if (previousReleaseDate && modifiedDate && isAfter(new Date(modifiedDate), new Date(previousReleaseDate))) {
    const dateFormat = showModifiedTime ? 'PPp' : 'PPP'
    return formatDate(modifiedDate, dateFormat, language)
  }

  return undefined
}

export function getReleaseDatesFromStatregAPI(shortname: string): StatregApiReleaseDates {
  const now = new Date()
  now.setHours(8, 0, 0, 0)

  const releases = fetchReleasesFromStatregApi({
    shortname,
    approval_status: 'GODKJENT',
  })

  if (!releases || 'error' in releases || releases.length === 0) return {}

  const previousReleaseDates = releases
    .filter(({ publish_time }) => isAfter(now, new Date(publish_time!)))
    .map(({ publish_time }) => publish_time)
  const nextReleaseDates = releases
    .filter(({ publish_time }) => !isAfter(now, new Date(publish_time!)))
    .map(({ publish_time }) => publish_time)

  return {
    previousReleaseDate: previousReleaseDates.length ? previousReleaseDates[previousReleaseDates.length - 1] : '',
    nextReleaseDate: nextReleaseDates.length ? nextReleaseDates[0] : '',
    previewNextReleaseDate: nextReleaseDates.length > 1 ? nextReleaseDates[1] : '',
  }
}
