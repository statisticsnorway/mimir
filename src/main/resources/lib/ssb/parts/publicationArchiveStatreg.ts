import { run } from '/lib/xp/context'
import { getStatisticsContentByShortname, type ContentLight, type Release } from '/lib/ssb/repo/statisticVariant'
import { fetchArchiveReleasePair, type VariantRelease } from '/lib/ssb/statreg/statistics'
import { setDateTimeAsOsloTimeZone } from '/lib/ssb/utils/dateUtils'
import { calculatePeriod } from '/lib/ssb/utils/variantUtils'

function releaseTime(value: string): number {
  if (!value) return NaN
  const iso = value.replace(' ', 'T')
  return Date.parse(/(Z|[+-]\d\d:\d\d)$/.test(iso) ? iso : setDateTimeAsOsloTimeZone(iso))
}

function period(release: VariantRelease | undefined, stored: string, frequency: string, language: string) {
  return release?.period_from && release.period_to
    ? calculatePeriod(frequency, release.period_from, release.period_to, language)
    : stored
}

export function getApiArchiveVariants(variants: ContentLight<Release>[], language: string): ContentLight<Release>[] {
  if (!variants.length) return []
  const names = variants.map(({ data }) => data.shortName)
  const pages = run({ branch: 'master' }, () => getStatisticsContentByShortname(names, language).hits)
  const shortnames = new Map(pages.map((page) => [page._id, page.data.shortname] as const))

  let apiAvailable = true
  return variants.map((variant) => {
    const data = variant.data
    if (!apiAvailable || !data.mainSubjects?.length || !data.statisticContentId) return variant
    const shortname = shortnames.get(data.statisticContentId) || data.shortName
    try {
      const pair = fetchArchiveReleasePair(
        shortname,
        data.variantId,
        releaseTime(data.previousRelease),
        releaseTime(data.nextRelease)
      )
      return {
        ...variant,
        data: {
          ...data,
          previousPeriod: period(pair.previous, data.previousPeriod, data.frequency, language),
          nextPeriod: period(pair.next, data.nextPeriod, data.frequency, language),
        },
      }
    } catch (error) {
      log.warning(`Archive cache refresh stopped fetching Statreg periods at ${shortname}/${data.variantId}: ${error}`)
      apiAvailable = false
      return variant
    }
  })
}
