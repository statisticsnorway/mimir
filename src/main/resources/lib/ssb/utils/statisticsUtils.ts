import '/lib/ssb/polyfills/nashorn'
import { type Content } from '/lib/xp/content'
import { StatisticInListing, VariantInListing, ReleaseDatesVariant } from '/lib/ssb/dashboard/statreg/types'
import { formatDate } from '/lib/ssb/utils/dateUtils'
import { isAfter } from '/lib/vendor/dateFns'
import { ensureArray } from '/lib/ssb/utils/arrayUtils'
import { type StatisticsDates } from '/lib/types/partTypes/statisticHeader'
import { Phrases } from '/lib/types/language'
import { getReleaseDatesByVariants } from '/lib/ssb/statreg/statistics'
import { type Statistics } from '/site/content-types'

export function getStatisticTitle(statisticsContent: Content<Statistics>, statistic?: StatisticInListing): string {
  if (!statistic) {
    return statisticsContent.displayName
  }

  return statisticsContent.language === 'en' && statistic.nameEN ? statistic.nameEN : statistic.name
}

export function getStatisticsDates(
  statisticsContent: Content<Statistics>,
  statistic: StatisticInListing | undefined,
  phrases: Phrases,
  showDraft: boolean
): StatisticsDates {
  const showModifiedTime: boolean | undefined = statisticsContent.data.showModifiedDate?.modifiedOption.showModifiedTime
  const modifiedDate: string | undefined = statisticsContent.data.showModifiedDate?.modifiedOption?.lastModified
  let previousRelease: string | undefined = phrases.notAvailable
  let nextRelease: string | undefined = phrases.notYetDetermined
  let previewNextRelease: string | undefined = phrases.notYetDetermined
  let changeDate: string | undefined
  let nextReleaseDate: string | undefined
  let previousReleaseDate: string | undefined
  const language = statisticsContent.language === 'en' ? 'en' : 'nb'

  if (statistic) {
    const variants: Array<VariantInListing | undefined> = ensureArray(statistic.variants)
    const releaseDates: ReleaseDatesVariant = getReleaseDatesByVariants(variants as Array<VariantInListing>)
    nextReleaseDate = releaseDates.nextRelease[0]
    previousReleaseDate = releaseDates.previousRelease[0]

    if (releaseDates.nextRelease.length > 1 && releaseDates.nextRelease[1] !== '') {
      previewNextRelease = formatDate(releaseDates.nextRelease[1], 'PPP', language)
    }

    if (previousReleaseDate) {
      previousRelease = formatDate(previousReleaseDate, 'PPP', language)
    }

    if (nextReleaseDate) {
      nextRelease = formatDate(nextReleaseDate, 'PPP', language)
    }
  }

  if (statisticsContent.data.showModifiedDate && previousReleaseDate && modifiedDate) {
    if (isAfter(new Date(modifiedDate), new Date(previousReleaseDate))) {
      const dateFormat = showModifiedTime ? 'PPp' : 'PPP'
      changeDate = formatDate(modifiedDate, dateFormat, language)
    }
  }

  return {
    updatedPhrase: phrases.updated + ': ',
    nextUpdatePhrase: phrases.nextUpdate + ': ',
    changedPhrase: phrases.modified + ': ',
    changeDate,
    previousRelease: showDraft ? nextRelease : previousRelease,
    nextRelease: showDraft ? previewNextRelease : nextRelease,
  }
}
