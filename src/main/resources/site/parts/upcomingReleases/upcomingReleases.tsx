import React, { useState } from 'react'
import { Button, Link } from '@statisticsnorway/ssb-component-library'
import axios from 'axios'
import { ChevronDown } from 'react-feather'
import { parseISO } from 'date-fns/parseISO'
import { sanitize } from '../../../lib/ssb/utils/htmlUtils'
import {
  type FlattenedUpcomingReleasesDate,
  type FlattenedUpcomingReleases,
  type UpcomingReleasesProps,
} from '../../../lib/types/partTypes/upcomingReleases'
import {
  type PreparedContentRelease,
  type PreparedUpcomingRelease,
  type PreparedVariant,
  type PreparedStatistics,
  type YearReleases,
} from '../../../lib/types/variants'

// TODO: Need the flattened and transformed data to be typed

export const mergeAndSortReleases = (
  releases1: YearReleases[] | FlattenedUpcomingReleases[],
  releases2: PreparedContentRelease[] | FlattenedUpcomingReleases[]
) => {
  const merged = new Map()

  // Helper function to add data to the map
  const addToMap = (array: PreparedContentRelease[] | FlattenedUpcomingReleases[]) => {
    array.forEach((item) => {
      // Check if the date already exists in the map
      if (merged.has(item.date)) {
        // If it does, concat the releases
        merged.get(item.date).releases = merged
          .get(item.date)
          .releases.concat((item as FlattenedUpcomingReleases).releases)
      } else {
        // If not, add the item to the map
        merged.set(item.date, { ...item })
      }
    })
  }

  // Add both arrays to the map
  addToMap(releases1 as FlattenedUpcomingReleases[])
  addToMap(releases2)

  // Remove duplicate releases
  merged.forEach((value) => {
    const uniqueReleases = new Set()
    value.releases = value.releases.filter((release: PreparedUpcomingRelease) => {
      const isDuplicate = uniqueReleases.has(release.id)
      uniqueReleases.add(release.id)
      return !isDuplicate
    })
  })

  // Sort by date
  const array = Array.from(merged.values())
  const sortedArray = [...array].sort((a, b) => new Date(a.date).valueOf() - new Date(b.date).valueOf())
  return sortedArray
}

export const flattenReleases = (data: YearReleases[]) => {
  const flattenedReleases: FlattenedUpcomingReleases[] = data.flatMap((yearItem) =>
    yearItem.releases.flatMap((monthItem) =>
      monthItem.releases.flatMap((dayItem) => {
        // Construct the full date string
        const day = parseInt(dayItem.day) >= 10 ? dayItem.day : '0' + dayItem.day // Add 0-padding
        let month: string | number = parseInt(monthItem.month) + 1 // From the API -> January is 0, Dec is 11
        month = month >= 10 ? month : '0' + month // Add 0-padding
        const fullDate = `${yearItem.year}-${month}-${day}`

        // eslint-disable-next-line max-nested-callbacks
        const releases = dayItem.releases.map((release: PreparedStatistics) => ({
          id: release.id,
          name: release.name,
          type: release.type,
          mainSubject: release.mainSubject,
          url: release.statisticsPageUrl ?? '',
          variant: release.variant,
        }))

        return {
          date: fullDate,
          releases,
        }
      })
    )
  )
  return flattenedReleases
}

export const flattenContentReleases = (contentReleases: PreparedContentRelease[]) => {
  const releases: FlattenedUpcomingReleases[] = []

  contentReleases.forEach((item) => {
    const date = item.date.split('T')[0] // Get date, ignore rest
    const newReleaseItem = {
      id: item.id,
      name: item.name,
      type: item.type,
      mainSubject: item.mainSubject,
      url: item.upcomingReleaseLink,
    }

    const existing = releases.find((release) => new Date(release.date).toISOString().split('T')[0] === date)

    if (existing) {
      existing.releases.push(newReleaseItem)
    } else {
      const newReleaseDay: FlattenedUpcomingReleases = { date: date, releases: [] }
      newReleaseDay.releases.push(newReleaseItem)
      releases.push(newReleaseDay)
    }
  })
  return releases
}

const getLastReleaseDateInArray = (releases: PreparedContentRelease[]) => {
  const sorted = [...releases].sort((a, b) => new Date(a.date).valueOf() - new Date(b.date).valueOf())
  const lastDate = sorted[releases.length - 1].date.split('-')
  return {
    year: lastDate[0],
    month: lastDate[1],
    day: lastDate[2],
  }
}

function renderRelease(release: PreparedUpcomingRelease, index: number, date: FlattenedUpcomingReleasesDate) {
  const { type, name, variant, mainSubject, url, upcomingReleaseLink } = release
  const { day, monthName, year } = date
  const showPeriod = type === 'statistikk' || type === 'statistic'

  return (
    <li key={index} className='mb-3'>
      <div>
        {(!upcomingReleaseLink || !url) && (
          <span className='sr-only'>{`${name} - ${showPeriod ? (variant as PreparedVariant).period : ''}`}</span>
        )}

        {upcomingReleaseLink || url ? (
          // deepcode ignore DOMXSS: URL is sanitized in the backend
          <Link href={upcomingReleaseLink ?? url} linkType='header'>
            {name}
          </Link>
        ) : (
          <h3 className='mb-0' aria-hidden='true'>
            {name}
          </h3>
        )}

        {showPeriod && (
          <p className='mb-0' aria-hidden='true'>
            {(variant as PreparedVariant).period}
          </p>
        )}
        <p className='metadata' aria-hidden='true'>
          {day}. {monthName} {year} / <span className='type'>{type}</span> / {mainSubject}
        </p>
      </div>
    </li>
  )
}

function getShortMonthName(monthNumber: number, language: string) {
  const monthName = getMonthName(monthNumber, language).slice(0, 3)
  if (monthName === 'may' || monthName === 'mai') {
    return monthName
  }
  return monthName + '.'
}
function getMonthName(monthNumber: number, language: string) {
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
  return monthNames[monthNumber]
}

function UpcomingReleases(props: UpcomingReleasesProps) {
  const [releases, setReleases] = useState(
    mergeAndSortReleases(flattenReleases(props.releases), flattenContentReleases(props.contentReleasesNextXDays))
  )
  const [loading, setLoading] = useState(false)
  const [showAll, setShowAll] = useState(false)

  function fetchAllReleases() {
    const lastCountedDay = getLastReleaseDateInArray(releases)
    setLoading(true)
    setShowAll(true)
    axios
      .get(props.upcomingReleasesServiceUrl, {
        params: {
          start: `${lastCountedDay.year}-${parseInt(lastCountedDay.month)}-${parseInt(lastCountedDay.day)}`,
          showAll: true,
          language: props.language,
        },
      })
      .then((res) => {
        if (res.data.releases.length) {
          const newReleases = mergeAndSortReleases(
            flattenReleases(res.data.releases),
            flattenContentReleases(props.contentReleasesAfterXDays)
          )
          const allReleases = mergeAndSortReleases(releases, newReleases)
          setReleases(allReleases)
        } else {
          setLoading(true)
        }
      })
      .finally(() => {
        setLoading(false)
      })
  }

  function renderDay(dayWithReleases: FlattenedUpcomingReleases, language: string, isFirst: boolean) {
    const date = parseISO(dayWithReleases.date)
    const releaseDate = {
      day: date.getDate(),
      monthName: getShortMonthName(date.getMonth(), language),
      year: date.getFullYear(),
    }
    const day = date.getDate()
    const month = date.getMonth()

    return (
      <div className={`calendar-day ${isFirst ? 'first' : ''}`} key={day}>
        <div className='time-wrapper'>
          <time aria-hidden='true' dateTime={date.toISOString()}>
            <span className='day'>{day}</span>
            <span className='month'>{getShortMonthName(month, language)}</span>
          </time>
        </div>
        <span id={`datemonth-${day}`} className='sr-only' aria-hidden='true'>{`${day}. ${getShortMonthName(
          month,
          language
        )}`}</span>
        <ol className='releaseList' aria-labelledby={`heading-upcoming-releases datemonth-${day}`}>
          {dayWithReleases.releases.map((release, releaseIndex) => renderRelease(release, releaseIndex, releaseDate))}
        </ol>
      </div>
    )
  }

  function renderButton() {
    if (loading) {
      return (
        <div className='text-center'>
          <span className='spinner-border spinner-border' />
        </div>
      )
    } else {
      return (
        <Button className='button-more' disabled={loading || showAll} onClick={fetchAllReleases}>
          <ChevronDown size='18' />
          {props.buttonTitle}
        </Button>
      )
    }
  }

  function renderList(_releases: FlattenedUpcomingReleases[]) {
    const list = _releases.map((day) => renderDay(day, props.language, false))
    return list
  }

  return (
    <section className='nextStatisticsReleases container-fluid p-0'>
      <div className='col-12 upcoming-releases-head'>
        <div className='container py-5'>
          <h1 id='heading-upcoming-releases'>{props.title ? props.title : undefined}</h1>
          <div
            className='upcoming-releases-ingress'
            dangerouslySetInnerHTML={{
              __html: sanitize(props.preface!.replace(/&nbsp;/g, ' ')),
            }}
          ></div>
        </div>
      </div>
      <div className='col-12 release-list'>
        <div className='container mt-5'>
          <div className='row d-flex justify-content-center'>
            <div className='col-12 p-0'>
              {renderList(releases)}
              {renderButton()}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default (props: UpcomingReleasesProps) => <UpcomingReleases {...props} />
