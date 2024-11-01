import React from 'react'
import { Link } from '@statisticsnorway/ssb-component-library'
import { type ReleasedStatisticsProps } from '../../lib/types/partTypes/releasedStatistics'
import {
  type MonthReleases,
  type DayReleases,
  type YearReleases,
  type PreparedStatistics,
} from '../../lib/types/variants'

const ReleasedStatistics = (props: ReleasedStatisticsProps) => {
  const { language, title, releases } = props

  function renderRelease(release: PreparedStatistics, index: number) {
    const hrefStatistic = language === 'en' ? `/en/${release.shortName}` : `/${release.shortName}`
    return (
      <li key={index} className='front-page-released-statistic'>
        <Link
          href={hrefStatistic}
          linkType='header'
          headingSize={3}
          ariaLabel={`${release.name} - ${release.variant.period}`}
          standAlone
        >
          {release.name}
        </Link>
        <p className='my-2' aria-hidden='true'>
          {release.variant.period}
        </p>
      </li>
    )
  }

  function renderDay(day: DayReleases, month: MonthReleases, year: YearReleases, index: number) {
    const monthNumber = Number(month.month)
    const monthPadded = monthNumber < 9 ? '0' + (monthNumber + 1) : monthNumber + 1
    const dayPadded = +day.day < 10 ? '0' + day.day : day.day
    const dateTime = `${year.year}-${monthPadded}-${dayPadded}`
    const monthNames =
      language === 'en'
        ? [
            'january',
            'february',
            'march',
            'april',
            'may',
            'june',
            'july',
            'august',
            'september',
            'october',
            'november',
            'december',
          ]
        : [
            'januar',
            'februar',
            'mars',
            'april',
            'mai',
            'juni',
            'juli',
            'august',
            'september',
            'oktober',
            'november',
            'desember',
          ]
    const monthNameLong = monthNames[monthNumber]

    return (
      <div className={`calendar-day ${index === 0 && 'first'}`} key={index}>
        <div className='time-wrapper'>
          <time aria-hidden='true' dateTime={dateTime}>
            <span className='day'>{day.day}</span>
            <span className='month'>{month.monthName}</span>
          </time>
        </div>
        <span
          id={`datemonth-${monthNumber}${index}`}
          aria-hidden='true'
          className='sr-only'
        >{`${day.day}. ${monthNameLong}`}</span>
        <ol className='releaseList' aria-labelledby={`heading-released-statistics datemonth-${monthNumber}${index}`}>
          {day.releases.map((release, releaseIndex) => renderRelease(release, releaseIndex))}
        </ol>
      </div>
    )
  }

  return (
    <section className='nextStatisticsReleases container-fluid'>
      <h2 className='mb-4' id='heading-released-statistics'>
        {title}
      </h2>
      {[...releases].reverse().map((year) => {
        return [...year.releases].reverse().map((month) => {
          return [...month.releases].reverse().map((day, index) => renderDay(day, month, year, index))
        })
      })}
    </section>
  )
}

export default (props: ReleasedStatisticsProps) => <ReleasedStatistics {...props} />
