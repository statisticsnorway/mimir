import { Request } from 'enonic-types/controller'
import { React4xp, React4xpResponse } from '../../../lib/types/react4xp'
import { Content } from 'enonic-types/content'
import { PortalLibrary } from 'enonic-types/portal'
import { StatisticInListing, VariantInListing } from '../../../lib/ssb/dashboard/statreg/types'
import { DateUtilsLib } from '../../../lib/ssb/utils/dateUtils'
import { VariantUtilsLib, YearReleases } from '../../../lib/ssb/utils/variantUtils'
import { ArrayUtilsLib } from '../../../lib/ssb/utils/arrayUtils'

const React4xp: React4xp = __non_webpack_require__('/lib/enonic/react4xp')
const {
  getComponent,
  getContent
}: PortalLibrary = __non_webpack_require__('/lib/xp/portal')
const {
  checkLimitAndTrim
}: ArrayUtilsLib = __non_webpack_require__( '/lib/ssb/utils/arrayUtils')
const {
  checkVariantReleaseDate
}: DateUtilsLib = __non_webpack_require__( '/lib/ssb/utils/dateUtils')
const {
  calculatePeriode,
  groupStatisticsByYearMonthAndDay
}: VariantUtilsLib = __non_webpack_require__( '/lib/ssb/utils/dateUtils')
const {
  getAllStatisticsFromRepo
} = __non_webpack_require__( '/lib/ssb/statreg/statistics')


exports.get = (req: Request): React4xpResponse => {
  return renderPart(req)
}

exports.preview = (req: Request): React4xpResponse => renderPart(req)

let currentLanguage: string = ''

function renderPart(req: Request): React4xpResponse {
  const content: Content = getContent()
  currentLanguage = content.language ? content.language : 'nb'

  const numberOfReleases: number = 10

  // Get statistics
  const releases: Array<StatisticInListing> = getAllStatisticsFromRepo()

  // All statistics published today, and fill up with previous releases.
  const releasesFiltered: Array<StatisticInListing> = filterOnComingReleases(releases, numberOfReleases)

  // Choose the right variant and prepare the date in a way it works with the groupBy function
  const releasesPrepped: Array<PreparedStatistics> = releasesFiltered.map((release: StatisticInListing) => prepareRelease(release, currentLanguage))

  // group by year, then month, then day
  const groupedWithMonthNames: Array<YearReleases> = groupStatisticsByYearMonthAndDay(releasesPrepped, currentLanguage)

  const props: PartProps = {}

  return React4xp.render('site/parts/articleList/articleList', props, req)
}


function filterOnComingReleases(stats: Array<StatisticInListing>, numberOfReleases: number): Array<StatisticInListing> {
  const releases: Array<StatisticInListing> = []
  for (let i: number = 0; releases.length < numberOfReleases; i++) {
    const day: Date = new Date()
    day.setDate(day.getDate() + i)
    const releasesOnThisDay: Array<StatisticInListing> = stats.reduce((acc: Array<StatisticInListing>, stat: StatisticInListing) => {
      const thisDayReleasedVariants: Array<VariantInListing> | undefined = Array.isArray(stat.variants) ?
        stat.variants.filter((variant: VariantInListing) => {
          return checkVariantReleaseDate(variant, day)
        }) :
        checkVariantReleaseDate(stat.variants, day) ? [stat.variants] : undefined
      if (thisDayReleasedVariants && thisDayReleasedVariants.length > 0) {
        acc.push({
          ...stat,
          variants: thisDayReleasedVariants
        })
      }
      return acc
    }, [])
    const trimmed: Array<StatisticInListing> = checkLimitAndTrim(releases, releasesOnThisDay, numberOfReleases)
    releases.push(...trimmed)
  }
  return releases
}


function prepareRelease(release: StatisticInListing, locale: string): PreparedStatistics {
  const preparedVariant: PreparedVariant = Array.isArray(release.variants) ?
    concatReleaseTimes(release.variants, locale) :
    formatVariant(release.variants)
  return {
    id: release.id,
    name: locale === 'en' ? release.nameEN : release.name,
    shortName: release.shortName,
    variant: preparedVariant
  }
}

function concatReleaseTimes(variants: Array<VariantInListing>, locale: string): PreparedVariant {
  const defaultVariant: PreparedVariant = formatVariant(variants[0])
  const timePeriodes: Array<string> = variants.map((variant: VariantInListing) => calculatePeriode(variant, currentLanguage))
  const formatedTimePeriodes: string = timePeriodes.join(` ${localize({
    key: 'and',
    locale
  })} `)
  return {
    ...defaultVariant,
    period: formatedTimePeriodes
  }
}

function formatVariant(variant: VariantInListing): PreparedVariant {
  const date: Date = new Date(variant.previousRelease)
  return {
    id: variant.id,
    day: date.getDate(),
    monthNumber: date.getMonth(),
    year: date.getFullYear(),
    frequency: variant.frekvens,
    period: calculatePeriode(variant, currentLanguage)
  }
}


/*
*  Interfaces
*/
interface PartProps {
    list?: Array<PreparedStatistics>;
}

interface PreparedStatistics {
    id: number;
    name: string;
    shortName: string;
    variant: PreparedVariant;
}

interface PreparedVariant {
    id: string;
    day: number;
    monthNumber: number;
    year: number;
    frequency: string;
    period: string;
}

interface GroupedBy<T> {
    [key: string]: Array<T> | T;
}

