import { Content } from 'enonic-types/content'

__non_webpack_require__('/lib/ssb/polyfills/nashorn')
import { Request, Response } from 'enonic-types/controller'
import { StatisticInListing, VariantInListing } from '../../../lib/ssb/dashboard/statreg/types'
import { React4xp, React4xpObject, React4xpResponse } from '../../../lib/types/react4xp'
import { Component, PortalLibrary } from 'enonic-types/portal'
import { ReleasedStatisticsPartConfig } from './releasedStatistics-part-config'
import { I18nLibrary } from 'enonic-types/i18n'
import { DateUtilsLib } from '../../../lib/ssb/utils/dateUtils'
import { VariantUtilsLib, YearReleases } from '../../../lib/ssb/utils/variantUtils'
import { ArrayUtilsLib } from '../../../lib/ssb/utils/arrayUtils'
// eslint-disable-next-line @typescript-eslint/typedef
const moment = require('moment/min/moment-with-locales')
moment.locale('nb')

const React4xp: React4xp = __non_webpack_require__('/lib/enonic/react4xp')

const {
  localize
}: I18nLibrary = __non_webpack_require__( '/lib/xp/i18n')

const {
  getAllStatisticsFromRepo
} = __non_webpack_require__( '/lib/ssb/statreg/statistics')
const {
  renderError
} = __non_webpack_require__( '/lib/ssb/error/error')
const {
  getComponent,
  getContent
}: PortalLibrary = __non_webpack_require__('/lib/xp/portal')
const {
  getWeek
} = __non_webpack_require__('/lib/ssb/utils/utils')
const {
  data: {
    forceArray
  }
} = __non_webpack_require__( '/lib/util')
const {
  checkLimitAndTrim
}: ArrayUtilsLib = __non_webpack_require__( '/lib/ssb/utils/arrayUtils')
const {
  checkVariantReleaseDate
}: DateUtilsLib = __non_webpack_require__( '/lib/ssb/utils/dateUtils')
const {
  calculatePeriode,
  addMonthNames,
  groupStatisticsByYearMonthAndDay
}: VariantUtilsLib = __non_webpack_require__( '/lib/ssb/utils/variantUtils')

exports.get = function(req: Request): React4xpResponse {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

exports.preview = (req: Request): React4xpResponse => renderPart(req)

export function renderPart(req: Request): React4xpResponse {
  const content: Content = getContent()
  const currentLanguage: string = content.language ? content.language : 'nb'

  const part: Component<ReleasedStatisticsPartConfig> = getComponent()
  const numberOfReleases: number = part.config.numberOfStatistics ? parseInt(part.config.numberOfStatistics) : 8
  // Get statistics
  const releases: Array<StatisticInListing> = getAllStatisticsFromRepo()

  // All statistics published today, and fill up with previous releases.
  const releasesFiltered: Array<StatisticInListing> = filterOnPreviousReleases(releases, numberOfReleases)

  // Choose the right variant and prepare the date in a way it works with the groupBy function
  const releasesPrepped: Array<PreparedStatistics> = releasesFiltered.map((release: StatisticInListing) => prepareRelease(release, currentLanguage))

  // group by year, then month, then day
  const groupedByYearMonthAndDay: GroupedBy<GroupedBy<GroupedBy<PreparedStatistics>>> = groupStatisticsByYearMonthAndDay(releasesPrepped)
  // iterate and format month names
  const groupedWithMonthNames: Array<YearReleases> = addMonthNames(groupedByYearMonthAndDay, currentLanguage)

  const props: PartProps = {
    releases: groupedWithMonthNames,
    title: localize({
      key: 'newStatistics',
      locale: currentLanguage
    }),
    language: currentLanguage
  }
  return React4xp.render('ReleasedStatistics', props, req)
}

function prepareRelease(release: StatisticInListing, language: string): PreparedStatistics {
  const preparedVariant: PreparedVariant = Array.isArray(release.variants) ?
    concatReleaseTimes(release.variants, language) :
    formatVariant(release.variants, language)
  return {
    id: release.id,
    name: language === 'en' ? release.nameEN : release.name,
    shortName: release.shortName,
    variant: preparedVariant
  }
}

function concatReleaseTimes(variants: Array<VariantInListing>, language: string): PreparedVariant {
  const defaultVariant: PreparedVariant = formatVariant(variants[0], language)
  const timePeriodes: Array<string> = variants.map((variant: VariantInListing) => calculatePeriode(variant, language))
  const formatedTimePeriodes: string = timePeriodes.join(` ${localize({
    key: 'and',
    locale: language
  })} `)
  return {
    ...defaultVariant,
    period: formatedTimePeriodes
  }
}

function formatVariant(variant: VariantInListing, language: string): PreparedVariant {
  const date: Date = new Date(variant.previousRelease)
  return {
    id: variant.id,
    day: date.getDate(),
    monthNumber: date.getMonth(),
    year: date.getFullYear(),
    frequency: variant.frekvens,
    period: calculatePeriode(variant, language)
  }
}

function filterOnPreviousReleases(stats: Array<StatisticInListing>, numberOfReleases: number): Array<StatisticInListing> {
  const releases: Array<StatisticInListing> = []
  for (let i: number = 0; releases.length < numberOfReleases; i++) {
    const day: Date = new Date()
    day.setDate(day.getDate() - i)
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

/*
*  Interfaces
*/

interface PartProps {
  releases: Array<YearReleases>;
  title: string;
  language: string;
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


